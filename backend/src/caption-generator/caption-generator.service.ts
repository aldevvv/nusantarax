import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { BusinessInfoService } from '../business-info/business-info.service';
import { createClient } from '@supabase/supabase-js';
import { CreateCaptionRequestDto } from './dto/create-caption-request.dto';
import { GetCaptionHistoryQueryDto } from './dto/get-caption-history-query.dto';

interface CaptionRequestWithFile extends CreateCaptionRequestDto {
  imageFile: Express.Multer.File;
}

@Injectable()
export class CaptionGeneratorService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private apiLogger: ApiLoggerService,
    private businessInfoService: BusinessInfoService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }

  /**
   * Check if user has sufficient requests for caption generation (2 requests required)
   * Uses actual usage from apiCallLog instead of manual tracking
   */
  private async checkSubscriptionLimits(userId: string, requestsNeeded: number = 2): Promise<void> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true }
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    // Get actual current usage from apiCallLog during subscription period
    const actualUsage = await this.prisma.apiCallLog.count({
      where: {
        userId,
        createdAt: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd,
        },
        status: 'SUCCESS',
      },
    });

    const remainingRequests = subscription.requestsLimit - actualUsage;

    if (subscription.requestsLimit !== -1 && remainingRequests < requestsNeeded) {
      throw new BadRequestException(
        `Insufficient requests. Need ${requestsNeeded} requests for caption generation, you have ${remainingRequests} remaining (actual usage: ${actualUsage}/${subscription.requestsLimit}).`
      );
    }

    console.log(`📊 Request check: Caption generation requires ${requestsNeeded} requests (${remainingRequests} remaining, actual usage: ${actualUsage})`);
  }

  /**
   * Build business context string for AI processing
   */
  private async buildBusinessContext(userId: string): Promise<string | null> {
    try {
      const businessInfo = await this.businessInfoService.findByUserId(userId);
      
      if (!businessInfo) {
        return null;
      }

      let context = `Business: ${businessInfo.businessName}`;
      
      if (businessInfo.description) {
        context += `\nDescription: ${businessInfo.description}`;
      }
      
      if (businessInfo.category) {
        context += `\nCategory: ${businessInfo.category}`;
      }
      
      if (businessInfo.brandVoice) {
        context += `\nBrand Voice: ${businessInfo.brandVoice}`;
      }
      
      if (businessInfo.targetAudience) {
        context += `\nTarget Audience: ${businessInfo.targetAudience}`;
      }
      
      if (businessInfo.brandColors && Array.isArray(businessInfo.brandColors)) {
        context += `\nBrand Colors: ${(businessInfo.brandColors as string[]).join(', ')}`;
      }

      return context;
    } catch (error) {
      console.error('Error building business context:', error);
      return null;
    }
  }

  /**
   * Upload image to Supabase storage with retry mechanism
   */
  private async uploadImageToStorage(
    imageFile: Express.Multer.File,
    userId: string,
    bucketName: string = 'caption-generator-images'
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    
    const fileName = `caption-${timestamp}-${imageFile.originalname}`;
    const filePath = `${userId}/${year}/${month}/${fileName}`;

    try {
      console.log(`📤 Uploading image: ${fileName} (${imageFile.size} bytes)`);

      // Upload to Supabase storage
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: false,
        });

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrl } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log(`✅ Successfully uploaded image: ${publicUrl.publicUrl}`);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error(`❌ Image upload failed:`, error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Filter caption text to remove emojis and emdashes when disabled
   */
  private filterCaptionText(text: string, useEmojis: boolean): string {
    let filteredText = text;

    // Remove emojis if disabled
    if (!useEmojis) {
      // Remove all emoji characters using Unicode ranges
      filteredText = filteredText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F251}]/gu, '');
      
      // Clean up extra spaces left by emoji removal
      filteredText = filteredText.replace(/\s+/g, ' ').trim();
    }

    // Always remove emdashes
    filteredText = filteredText.replace(/—/g, '-').replace(/–/g, '-');

    return filteredText;
  }

  /**
   * Main orchestration method - Full 2-step caption generation process
   * Total: 2 API calls to gemini-2.5-pro
   */
  async generateCaptionsWithAnalysis(
    userId: string,
    dto: CaptionRequestWithFile
  ): Promise<any> {
    
    // 🔧 CRITICAL: Ensure language defaults to 'EN' if not provided
    const finalLanguage = dto.language || 'EN';
    
    // DEBUG: Log the language parameter flow
    console.log('🔍 DEBUG Language Flow:', {
      dtoLanguage: dto.language,
      finalLanguage: finalLanguage,
      userId,
      platform: dto.platform,
      isIndonesian: finalLanguage === 'ID',
      isEnglish: finalLanguage === 'EN'
    });
    
    // Check subscription limits (2 requests required)
    await this.checkSubscriptionLimits(userId, 2);

    const requestId = `caption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Upload image to Supabase storage
      const imageUrl = await this.uploadImageToStorage(
        dto.imageFile,
        userId,
        'caption-generator-images'
      );

      // Create request record
      const request = await this.prisma.captionGenerationRequest.create({
        data: {
          userId,
          requestId,
          imageUrl,
          imageFileName: dto.imageFile.originalname,
          captionIdea: dto.captionIdea,
          platform: dto.platform,
          targetAudience: dto.targetAudience,
          tone: dto.tone,
          captionLength: dto.captionLength,
          useEmojis: dto.useEmojis ?? true,
          useHashtags: dto.useHashtags ?? true,
          includeBusinessInfo: dto.includeBusinessInfo || false,
          status: 'ANALYZING_IMAGE',
        }
      });

      // Get business context if enabled
      let businessContext: string | undefined = undefined;
      if (dto.includeBusinessInfo) {
        const businessCtx = await this.buildBusinessContext(userId);
        businessContext = businessCtx || undefined;
      }

      // STEP 1: Image Analysis + Caption Generation (1 request)
      console.log(`🔄 Step 1: Analyzing image and generating captions...`);
      console.log('🔍 DEBUG Step 1 Language:', {
        dtoLanguage: dto.language,
        finalLanguage: finalLanguage,
        beforeGeminiCall: true,
        willUseIndonesian: finalLanguage === 'ID'
      });
      
      const captionResult = await this.geminiService.analyzeImageAndGenerateCaptions(
        dto.imageFile,
        {
          captionIdea: dto.captionIdea,
          platform: dto.platform,
          targetAudience: dto.targetAudience,
          tone: dto.tone,
          captionLength: dto.captionLength,
          useEmojis: dto.useEmojis ?? true,
          useHashtags: dto.useHashtags ?? true,
          language: finalLanguage,
          businessContext,
        },
        userId
      );

      // Update status
      await this.prisma.captionGenerationRequest.update({
        where: { id: request.id },
        data: { 
          status: 'ANALYZING_CAPTIONS',
          imageAnalysisInputTokens: captionResult.inputTokens,
          imageAnalysisOutputTokens: captionResult.outputTokens,
        }
      });

      // STEP 2: Positive Caption Analysis (1 request)
      console.log(`🔄 Step 2: Analyzing generated captions...`);
      console.log('🔍 DEBUG Step 2 Language:', {
        dtoLanguage: dto.language,
        finalLanguage: finalLanguage,
        beforeAnalysisCall: true,
        willUseIndonesian: finalLanguage === 'ID'
      });
      
      const analysisResult = await this.geminiService.analyzeGeneratedCaptions(
        captionResult.captions.map((cap, idx) => ({
          text: cap.text,
          hashtags: cap.hashtags,
          variation: idx + 1,
          approach: cap.approach
        })),
        dto.platform,
        captionResult.imageAnalysis,
        finalLanguage,
        userId
      );

      // Save all 3 caption results
      const savedResults = await Promise.all(
        captionResult.captions.map(async (caption, index) => {
          const analysis = analysisResult.analyses[index];
          
          const filteredCaptionText = this.filterCaptionText(caption.text, dto.useEmojis ?? true);
          
          return this.prisma.captionGenerationResult.create({
            data: {
              requestId: request.id,
              captionText: filteredCaptionText,
              hashtags: caption.hashtags,
              platform: dto.platform,
              characterCount: filteredCaptionText.length,
              hashtagCount: (caption.hashtags.match(/#/g) || []).length,
              order: index + 1,
              // Enhanced 6-Metric Analysis (7-10 scores, positive only)
              engagementScore: analysis.engagementScore,
              readabilityScore: analysis.readabilityScore,
              ctaStrength: analysis.ctaStrength,
              brandVoiceScore: analysis.brandVoiceScore,
              trendingPotential: analysis.trendingPotential,
              emotionalImpact: analysis.emotionalImpact,
              hookEffectiveness: analysis.hookEffectiveness,
              platformOptimization: analysis.platformOptimization,
              keywordRelevance: analysis.keywordRelevance,
              viralityPotential: analysis.viralityPotential,
              analysisDetails: analysis,
            }
          });
        })
      );

      // Final update
      const finalRequest = await this.prisma.captionGenerationRequest.update({
        where: { id: request.id },
        data: {
          status: 'COMPLETED',
          totalCaptions: savedResults.length,
          captionAnalysisInputTokens: analysisResult.inputTokens,
          captionAnalysisOutputTokens: analysisResult.outputTokens,
          totalTokens: captionResult.inputTokens + captionResult.outputTokens + 
                      analysisResult.inputTokens + analysisResult.outputTokens,
          completedAt: new Date(),
          analysisModel: captionResult.model,
        },
        include: {
          results: {
            orderBy: { order: 'asc' }
          }
        }
      });

      console.log(`✅ Caption generation completed successfully: ${savedResults.length} captions generated`);
      return finalRequest;

    } catch (error) {
      console.error(`❌ Caption generation failed:`, error.message);
      
      // Update request status to failed
      await this.prisma.captionGenerationRequest.update({
        where: { requestId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        }
      }).catch(() => {}); // Ignore update errors

      throw error;
    }
  }

  /**
   * Get user's caption generation history with pagination
   */
  async getCaptionHistory(
    userId: string,
    query: GetCaptionHistoryQueryDto
  ) {
    const { page = 1, limit = 10, status, platform, startDate, endDate, search } = query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (platform) {
      whereClause.platform = platform;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (search) {
      whereClause.OR = [
        { captionIdea: { contains: search, mode: 'insensitive' } },
        { targetAudience: { contains: search, mode: 'insensitive' } },
        { requestId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get requests with pagination
    const [requests, total] = await Promise.all([
      this.prisma.captionGenerationRequest.findMany({
        where: whereClause,
        include: {
          results: {
            where: { isDeleted: false },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.captionGenerationRequest.count({
        where: whereClause,
      }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    };
  }

  /**
   * Get specific caption generation request by ID
   */
  async getCaptionRequest(userId: string, requestId: string) {
    const request = await this.prisma.captionGenerationRequest.findFirst({
      where: { 
        userId,
        requestId 
      },
      include: {
        results: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Caption generation request not found');
    }

    return request;
  }

  /**
   * Delete a specific caption result
   */
  async deleteCaptionResult(userId: string, resultId: string) {
    // Find the result and verify ownership
    const result = await this.prisma.captionGenerationResult.findFirst({
      where: { 
        id: resultId,
        request: { userId }
      },
      include: { request: true }
    });

    if (!result) {
      throw new NotFoundException('Caption result not found');
    }

    // Mark as deleted (soft delete)
    await this.prisma.captionGenerationResult.update({
      where: { id: resultId },
      data: { isDeleted: true }
    });

    return { message: 'Caption deleted successfully' };
  }

  /**
   * Get user's caption generation statistics
   */
  async getUserCaptionStats(userId: string) {
    const [totalRequests, completedRequests, failedRequests, totalCaptions] = await Promise.all([
      this.prisma.captionGenerationRequest.count({
        where: { userId }
      }),
      this.prisma.captionGenerationRequest.count({
        where: { userId, status: 'COMPLETED' }
      }),
      this.prisma.captionGenerationRequest.count({
        where: { userId, status: 'FAILED' }
      }),
      this.prisma.captionGenerationResult.count({
        where: { 
          request: { userId },
          isDeleted: false 
        }
      }),
    ]);

    const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      completedRequests,
      failedRequests,
      totalCaptions,
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}