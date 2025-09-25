import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { BusinessInfoService } from '../business-info/business-info.service';
import { createClient } from '@supabase/supabase-js';
import { CreateTemplateRequestDto } from './dto/create-template-request.dto';
import { CreateCustomRequestDto } from './dto/create-custom-request.dto';
import { GetHistoryQueryDto } from './dto/get-history-query.dto';

@Injectable()
export class ImageGeneratorService {
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
   * Get all available image templates
   */
  async getTemplates(category?: string) {
    const whereClause = category ? { category, isActive: true } : { isActive: true };
    
    const templates = await this.prisma.imageTemplate.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'asc' },
    });

    return templates;
  }

  /**
   * Get template categories
   */
  async getTemplateCategories() {
    const categories = await this.prisma.imageTemplate.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
    });

    return categories.map(cat => ({
      category: cat.category,
      count: cat._count.id
    }));
  }

  /**
   * Check if user has sufficient requests for image generation (variable image count)
   * 🔧 FIX: Use actual usage from apiCallLog instead of manual tracking
   */
  private async checkSubscriptionLimits(userId: string, imageCount: number = 3): Promise<void> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true }
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    // 🔧 FIX: Get actual current usage from apiCallLog during subscription period
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

    const requiredRequests = 3 + imageCount; // Analysis + Enhancement + Prompt Creation + N Images
    const remainingRequests = subscription.requestsLimit - actualUsage;

    if (subscription.requestsLimit !== -1 && remainingRequests < requiredRequests) {
      throw new BadRequestException(
        `Insufficient requests. Need ${requiredRequests} requests for generating ${imageCount} images, you have ${remainingRequests} remaining (actual usage: ${actualUsage}/${subscription.requestsLimit}).`
      );
    }

    console.log(`📊 Request check: ${imageCount} images require ${requiredRequests} requests (${remainingRequests} remaining, actual usage: ${actualUsage})`);
  }

  /**
   * 🔧 REMOVED: Manual deduction - we rely on apiLogger.logApiCall only
   * The apiLogger.logApiCall in GeminiService will handle all request tracking
   */
  private logOperation(userId: string, operation: string): void {
    console.log(`📝 Operation logged: ${operation} for user ${userId} (tracked via apiCallLog)`);
  }

  /**
   * 🔧 REMOVED: Rollback not needed since we don't manually track anymore
   * Failed requests won't be logged as SUCCESS in apiCallLog, so they won't count
   */
  private logRollback(userId: string, requestsToRollback: number): void {
    console.log(`🔄 Rollback not needed for ${requestsToRollback} requests for user ${userId} (apiCallLog handles failed requests automatically)`);
  }

  /**
   * Build business context string for prompt enhancement
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
   * 🔧 ROBUST: Upload generated image to Supabase storage with retry mechanism
   */
  private async uploadImageToStorageWithRetry(
    imageData: string,
    userId: string,
    requestId: string,
    order: number,
    maxRetries: number = 5
  ): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
  }> {
    // Validate image data format
    if (!imageData || typeof imageData !== 'string') {
      throw new Error('Invalid image data: data is empty or not a string');
    }

    // Check if imageData is HTML (error response)
    if (imageData.trim().startsWith('<') || imageData.includes('<html')) {
      throw new Error('Invalid image data: received HTML response instead of image data');
    }

    // Ensure proper data URL format
    let processedImageData = imageData;
    if (!imageData.startsWith('data:')) {
      processedImageData = `data:image/png;base64,${imageData}`;
    }

    // Convert base64 to buffer
    const base64Data = processedImageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    if (!base64Data || base64Data.length < 100) {
      throw new Error('Invalid image data: base64 data is too short or empty');
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64Data, 'base64');
    } catch (bufferError) {
      throw new Error(`Invalid base64 data: ${bufferError.message}`);
    }

    if (buffer.length < 1000) {
      throw new Error(`Invalid image data: buffer too small (${buffer.length} bytes)`);
    }
    
    // Generate file path with organized structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now() + order; // Add order to avoid conflicts
    
    const fileName = `img-gen-${requestId}-${order}-${timestamp}.png`;
    const filePath = `${userId}/${year}/${month}/${fileName}`;

    // 🔧 RETRY LOGIC: Try upload with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Uploading image ${order} (attempt ${attempt}/${maxRetries}): ${fileName} (${buffer.length} bytes)`);

        // Ensure bucket exists (only on first attempt to avoid spam)
        if (attempt === 1) {
          const { data: buckets } = await this.supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === 'generated-images');
          
          if (!bucketExists) {
            console.log('📦 Creating generated-images bucket...');
            const { error: createError } = await this.supabase.storage.createBucket('generated-images', {
              public: true,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
              fileSizeLimit: 10485760, // 10MB limit
            });
            
            if (createError) {
              console.warn('Failed to create bucket (may already exist):', createError.message);
            }
          }
        }

        // Upload to Supabase storage
        const { data, error } = await this.supabase.storage
          .from('generated-images')
          .upload(filePath, buffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        // Get public URL
        const { data: publicUrl } = this.supabase.storage
          .from('generated-images')
          .getPublicUrl(filePath);

        console.log(`✅ Successfully uploaded image ${order} on attempt ${attempt}: ${publicUrl.publicUrl}`);

        return {
          url: publicUrl.publicUrl,
          fileName,
          fileSize: buffer.length
        };

      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        
        console.error(`❌ Upload attempt ${attempt}/${maxRetries} failed for image ${order}:`, error.message);
        
        if (isLastAttempt) {
          throw new Error(`Failed to upload after ${maxRetries} attempts: ${error.message}`);
        }
        
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached due to the throw in the last attempt
    throw new Error('Upload failed after all attempts');
  }

  /**
   * 🔧 NEW: Upload multiple images in parallel with graceful failure handling
   */
  private async uploadImagesInParallel(
    imageResults: Array<{ imageData: string; seed?: string; generationTime: number; }>,
    userId: string,
    requestId: string
  ): Promise<{
    successful: Array<{
      result: any;
      order: number;
      uploadResult: { url: string; fileName: string; fileSize: number; }
    }>;
    failed: Array<{ order: number; error: string; }>;
  }> {
    console.log(`🚀 Starting parallel upload of ${imageResults.length} images...`);
    
    // Create upload promises for all images
    const uploadPromises = imageResults.map(async (imageResult, index) => {
      const order = index + 1;
      
      try {
        const uploadResult = await this.uploadImageToStorageWithRetry(
          imageResult.imageData,
          userId,
          requestId,
          order
        );

        // Save to database immediately after successful upload
        const savedResult = await this.prisma.imageGenerationResult.create({
          data: {
            requestId: requestId,
            imageUrl: uploadResult.url,
            imageSize: '1024x1024',
            fileSize: uploadResult.fileSize,
            fileName: uploadResult.fileName,
            prompt: '', // Will be updated later with final prompt
            seed: imageResult.seed,
            generationTime: imageResult.generationTime,
            order,
          }
        });

        return {
          success: true,
          order,
          result: savedResult,
          uploadResult
        };
      } catch (error) {
        console.error(`❌ Failed to upload/save image ${order} after all retries:`, error.message);
        return {
          success: false,
          order,
          error: error.message
        };
      }
    });

    // Wait for all uploads to complete (successful or failed)
    const results = await Promise.allSettled(uploadPromises);
    
    const successful: Array<{ result: any; order: number; uploadResult: any; }> = [];
    const failed: Array<{ order: number; error: string; }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push({
          result: result.value.result,
          order: result.value.order,
          uploadResult: result.value.uploadResult
        });
      } else {
        const errorMessage = result.status === 'fulfilled'
          ? result.value.error
          : (result as any).reason?.message || 'Unknown upload error';
        
        failed.push({
          order: index + 1,
          error: errorMessage
        });
      }
    });

    console.log(`📊 Upload results: ${successful.length} successful, ${failed.length} failed`);
    
    return { successful, failed };
  }

  /**
   * Generate images using template
   */
  async generateFromTemplate(
    userId: string,
    dto: CreateTemplateRequestDto
  ): Promise<any> {
    const imageCount = dto.imageCount || 3;
    const aspectRatio = dto.aspectRatio || '3:4';
    
    // Check subscription limits first with variable image count
    await this.checkSubscriptionLimits(userId, imageCount);

    // Get template
    const template = await this.prisma.imageTemplate.findUnique({
      where: { id: dto.templateId }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Generate unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let requestsUsed = 0;

    try {
      // Create initial request record
      const request = await this.prisma.imageGenerationRequest.create({
        data: {
          userId,
          requestId,
          type: 'TEMPLATE',
          templateId: dto.templateId,
          originalPrompt: JSON.stringify(dto.inputFields),
          enhancedPrompt: '', // Will be updated
          inputFields: dto.inputFields,
          includeBusinessInfo: dto.includeBusinessInfo || false,
          style: dto.style,
          backgroundPreference: dto.backgroundPreference,
          status: 'PROCESSING',
        }
      });

      // Step 1: Build template prompt
      let templatePrompt = template.promptTemplate;
      Object.keys(dto.inputFields).forEach(key => {
        const value = dto.inputFields[key];
        templatePrompt = templatePrompt.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      // Step 2: Get business context if enabled (1 request)
      let businessContext: string | undefined = undefined;
      if (dto.includeBusinessInfo) {
        this.logOperation(userId, 'business-context-analysis');
        requestsUsed++; // Keep counter for rollback logging only
        businessContext = await this.buildBusinessContext(userId) || undefined;
      }

      // Step 3: Analyze prompt (1 request) - apiLogger will track this
      this.logOperation(userId, 'prompt-analysis');
      requestsUsed++;
      
      const analysisResult = await this.geminiService.analyzeAndEnhancePrompt(
        templatePrompt,
        businessContext,
        `Template: ${template.name}`,
        userId
      );

      // Step 4: Create final prompt (1 request) - apiLogger will track this
      this.logOperation(userId, 'prompt-creation');
      requestsUsed++;
      
      const finalPromptResult = await this.geminiService.createFinalPrompt(
        analysisResult.enhancedPrompt,
        businessContext,
        userId
      );

      // Update request with enhanced data
      await this.prisma.imageGenerationRequest.update({
        where: { id: request.id },
        data: {
          status: 'GENERATING',
          enhancedPrompt: finalPromptResult.finalPrompt,
          businessContext: businessContext || null,
          analysisModel: analysisResult.model,
          generationModel: 'imagen-4.0',
          analysisInputTokens: analysisResult.inputTokens,
          analysisOutputTokens: analysisResult.outputTokens,
          analysisTokens: analysisResult.inputTokens + analysisResult.outputTokens,
        }
      });

      // Step 5: Generate N images and save results (combined step)
      console.log(`🎨 Generating ${imageCount} images with ${aspectRatio} aspect ratio and saving results...`);
      const imageResults = await this.geminiService.generateImageWithImagen(
        finalPromptResult.finalPrompt,
        userId,
        {
          count: imageCount,
          aspectRatio: aspectRatio as any
        }
      );

      // 🔧 NEW: Use parallel upload with graceful failure handling
      const uploadResults = await this.uploadImagesInParallel(
        imageResults.images,
        userId,
        request.id
      );

      // Update final prompt for successful uploads
      if (uploadResults.successful.length > 0) {
        await Promise.all(uploadResults.successful.map(item =>
          this.prisma.imageGenerationResult.update({
            where: { id: item.result.id },
            data: { prompt: finalPromptResult.finalPrompt }
          })
        ));
      }

      const savedResults = uploadResults.successful.map(item => item.result);
      const failedUploads = uploadResults.failed;

      // 🔧 FAIR BILLING: Only count successful images for billing
      const actualSuccessfulImages = uploadResults.successful.length;

      console.log(`📊 Upload summary: ${actualSuccessfulImages} successful, ${failedUploads.length} failed`);
      if (failedUploads.length > 0) {
        console.log(`⚠️ Failed uploads:`, failedUploads.map(f => `Image ${f.order}: ${f.error}`));
      }

      // Final update with success/failure summary
      const status = savedResults.length > 0 ? 'COMPLETED' : 'FAILED';
      const errorMessage = savedResults.length === 0
        ? 'All image uploads failed'
        : failedUploads.length > 0
          ? `Partial success: ${failedUploads.length} uploads failed`
          : null;

      const finalRequest = await this.prisma.imageGenerationRequest.update({
        where: { id: request.id },
        data: {
          status,
          errorMessage,
          generationTokens: actualSuccessfulImages, // Only count successful images
          totalTokens: analysisResult.inputTokens + analysisResult.outputTokens +
                      finalPromptResult.inputTokens + finalPromptResult.outputTokens +
                      actualSuccessfulImages,
          totalImages: savedResults.length,
          completedAt: new Date(),
        },
        include: {
          template: true,
          results: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // 🔧 PARTIAL SUCCESS: Return result even if some uploads failed
      if (savedResults.length > 0 && failedUploads.length > 0) {
        console.log(`⚠️ Partial success: ${savedResults.length}/${imageResults.images.length} images saved successfully`);
      }

      return finalRequest;

    } catch (error) {
      // 🔧 FIX: No manual rollback needed - failed requests are not logged as SUCCESS in apiCallLog
      this.logRollback(userId, requestsUsed);
      
      // Update request status to failed
      await this.prisma.imageGenerationRequest.update({
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
   * Generate images using custom prompt
   */
  async generateFromCustom(
    userId: string,
    dto: CreateCustomRequestDto
  ): Promise<any> {
    const imageCount = dto.imageCount || 3;
    const aspectRatio = dto.aspectRatio || '3:4';
    
    // Check subscription limits first with variable image count
    await this.checkSubscriptionLimits(userId, imageCount);

    // Generate unique request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let requestsUsed = 0;

    try {
      // Create initial request record
      const request = await this.prisma.imageGenerationRequest.create({
        data: {
          userId,
          requestId,
          type: 'CUSTOM',
          originalPrompt: dto.prompt,
          enhancedPrompt: '', // Will be updated
          includeBusinessInfo: dto.includeBusinessInfo || false,
          style: dto.style,
          backgroundPreference: dto.backgroundPreference,
          status: 'PROCESSING',
        }
      });

      // Step 1: Get business context if enabled (1 request)
      let businessContext: string | undefined = undefined;
      if (dto.includeBusinessInfo) {
        this.logOperation(userId, 'business-context-analysis');
        requestsUsed++; // Keep counter for rollback logging only
        businessContext = await this.buildBusinessContext(userId) || undefined;
      }

      // Step 2: Analyze prompt (1 request) - apiLogger will track this
      this.logOperation(userId, 'prompt-analysis');
      requestsUsed++;
      
      const analysisResult = await this.geminiService.analyzeAndEnhancePrompt(
        dto.prompt,
        businessContext,
        'Custom Generation',
        userId
      );

      // Step 3: Create final prompt (1 request) - apiLogger will track this
      this.logOperation(userId, 'prompt-creation');
      requestsUsed++;
      
      const finalPromptResult = await this.geminiService.createFinalPrompt(
        analysisResult.enhancedPrompt,
        businessContext,
        userId
      );

      // Update request with enhanced data
      await this.prisma.imageGenerationRequest.update({
        where: { id: request.id },
        data: {
          status: 'GENERATING',
          enhancedPrompt: finalPromptResult.finalPrompt,
          businessContext: businessContext || null,
          analysisModel: analysisResult.model,
          generationModel: 'imagen-4.0',
          analysisInputTokens: analysisResult.inputTokens,
          analysisOutputTokens: analysisResult.outputTokens,
          analysisTokens: analysisResult.inputTokens + analysisResult.outputTokens,
        }
      });

      // Step 4: Generate N images and save results (combined step)
      console.log(`🎨 Generating ${imageCount} images with ${aspectRatio} aspect ratio and saving results...`);
      const imageResults = await this.geminiService.generateImageWithImagen(
        finalPromptResult.finalPrompt,
        userId,
        {
          count: imageCount,
          aspectRatio: aspectRatio as any
        }
      );

      // 🔧 NEW: Use parallel upload with graceful failure handling
      const uploadResults = await this.uploadImagesInParallel(
        imageResults.images,
        userId,
        request.id
      );

      // Update final prompt for successful uploads
      if (uploadResults.successful.length > 0) {
        await Promise.all(uploadResults.successful.map(item =>
          this.prisma.imageGenerationResult.update({
            where: { id: item.result.id },
            data: { prompt: finalPromptResult.finalPrompt }
          })
        ));
      }

      const savedResults = uploadResults.successful.map(item => item.result);
      const failedUploads = uploadResults.failed;

      // 🔧 FAIR BILLING: Only count successful images for billing
      const actualSuccessfulImages = uploadResults.successful.length;
      requestsUsed = 3 + actualSuccessfulImages + (dto.includeBusinessInfo ? 1 : 0);

      console.log(`📊 Upload summary: ${actualSuccessfulImages} successful, ${failedUploads.length} failed`);
      if (failedUploads.length > 0) {
        console.log(`⚠️ Failed uploads:`, failedUploads.map(f => `Image ${f.order}: ${f.error}`));
      }

      // Final update with success/failure summary
      const status = savedResults.length > 0 ? 'COMPLETED' : 'FAILED';
      const errorMessage = savedResults.length === 0
        ? 'All image uploads failed'
        : failedUploads.length > 0
          ? `Partial success: ${failedUploads.length} uploads failed`
          : null;

      const finalRequest = await this.prisma.imageGenerationRequest.update({
        where: { id: request.id },
        data: {
          status,
          errorMessage,
          generationTokens: actualSuccessfulImages, // Only count successful images
          totalTokens: analysisResult.inputTokens + analysisResult.outputTokens +
                      finalPromptResult.inputTokens + finalPromptResult.outputTokens +
                      actualSuccessfulImages,
          totalImages: savedResults.length,
          completedAt: new Date(),
        },
        include: {
          results: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // 🔧 PARTIAL SUCCESS: Return result even if some uploads failed
      if (savedResults.length > 0 && failedUploads.length > 0) {
        console.log(`⚠️ Partial success: ${savedResults.length}/${imageResults.images.length} images saved successfully`);
      }

      return finalRequest;

    } catch (error) {
      // 🔧 FIX: No manual rollback needed - failed requests are not logged as SUCCESS in apiCallLog
      this.logRollback(userId, requestsUsed);
      
      // Update request status to failed
      await this.prisma.imageGenerationRequest.update({
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
   * Get user's generation history with pagination
   */
  async getGenerationHistory(
    userId: string,
    query: GetHistoryQueryDto
  ) {
    const { page = 1, limit = 10, status, type, startDate, endDate, search } = query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (search) {
      whereClause.OR = [
        { originalPrompt: { contains: search, mode: 'insensitive' } },
        { enhancedPrompt: { contains: search, mode: 'insensitive' } },
        { requestId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get requests with pagination
    const [requests, total] = await Promise.all([
      this.prisma.imageGenerationRequest.findMany({
        where: whereClause,
        include: {
          template: true,
          results: {
            where: { isDeleted: false },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.imageGenerationRequest.count({
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
   * Get specific generation request by ID
   */
  async getGenerationRequest(userId: string, requestId: string) {
    const request = await this.prisma.imageGenerationRequest.findFirst({
      where: { 
        userId,
        requestId 
      },
      include: {
        template: true,
        results: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Generation request not found');
    }

    return request;
  }

  /**
   * Delete a specific generated image
   */
  async deleteGeneratedImage(userId: string, resultId: string) {
    // Find the result and verify ownership
    const result = await this.prisma.imageGenerationResult.findFirst({
      where: { 
        id: resultId,
        request: { userId }
      },
      include: { request: true }
    });

    if (!result) {
      throw new NotFoundException('Generated image not found');
    }

    // Mark as deleted (soft delete)
    await this.prisma.imageGenerationResult.update({
      where: { id: resultId },
      data: { isDeleted: true }
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Get user's generation statistics
   */
  async getUserGenerationStats(userId: string) {
    const [totalRequests, completedRequests, failedRequests, totalImages] = await Promise.all([
      this.prisma.imageGenerationRequest.count({
        where: { userId }
      }),
      this.prisma.imageGenerationRequest.count({
        where: { userId, status: 'COMPLETED' }
      }),
      this.prisma.imageGenerationRequest.count({
        where: { userId, status: 'FAILED' }
      }),
      this.prisma.imageGenerationResult.count({
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
      totalImages,
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}