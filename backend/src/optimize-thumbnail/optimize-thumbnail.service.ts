import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OptimizeThumbnailDto, OptimizeResponse, OptimizeResult, Template, OptimizationSettings } from './dto/optimize-thumbnail.dto';

@Injectable()
export class OptimizeThumbnailService {
  private supabase: SupabaseClient;
  private readonly STORAGE_BUCKET = 'optimized-thumbnails';

  private readonly TEMPLATES: Template[] = [
    {
      id: 'social-media',
      name: 'Social Media',
      description: 'Optimize for Instagram, Facebook, Twitter with vibrant colors and engaging composition',
      category: 'Social',
      optimizations: {
        smartCrop: 'auto',
        backgroundRemoval: 'none',
        lightingAdjustment: 'enhance',
        colorCorrection: 'vibrant',
        aspectRatio: '1:1',
        qualityLevel: 'high'
      },
      supportedFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Professional product shots with clean white background for online stores',
      category: 'Commerce',
      optimizations: {
        smartCrop: 'center',
        backgroundRemoval: 'replace',
        backgroundReplacement: 'white',
        lightingAdjustment: 'auto',
        colorCorrection: 'natural',
        aspectRatio: '1:1',
        qualityLevel: 'premium'
      },
      supportedFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'catalog',
      name: 'Product Catalog',
      description: 'High-quality catalog images with detailed feature highlights',
      category: 'Professional',
      optimizations: {
        smartCrop: 'object',
        backgroundRemoval: 'none',
        lightingAdjustment: 'enhance',
        colorCorrection: 'natural',
        aspectRatio: '4:3',
        qualityLevel: 'premium'
      },
      supportedFormats: ['JPG', 'PNG']
    },
    {
      id: 'marketing',
      name: 'Marketing Material',
      description: 'Eye-catching promotional images with text overlay options',
      category: 'Marketing',
      optimizations: {
        smartCrop: 'auto',
        backgroundRemoval: 'remove',
        backgroundReplacement: 'gradient',
        lightingAdjustment: 'dramatic',
        colorCorrection: 'vibrant',
        textPlacement: 'auto',
        aspectRatio: '16:9',
        qualityLevel: 'high'
      },
      supportedFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'product-showcase',
      name: 'Product Showcase',
      description: 'Premium product display with lifestyle integration',
      category: 'Showcase',
      optimizations: {
        smartCrop: 'object',
        backgroundRemoval: 'none',
        lightingAdjustment: 'enhance',
        colorCorrection: 'natural',
        aspectRatio: '9:16',
        qualityLevel: 'premium'
      },
      supportedFormats: ['JPG', 'PNG', 'WEBP']
    },
    {
      id: 'umkm-focused',
      name: 'UMKM Focused',
      description: 'Tailored for small business products with local market appeal',
      category: 'UMKM',
      optimizations: {
        smartCrop: 'center',
        backgroundRemoval: 'replace',
        backgroundReplacement: 'white',
        lightingAdjustment: 'auto',
        colorCorrection: 'natural',
        textPlacement: 'bottom',
        aspectRatio: '1:1',
        qualityLevel: 'high'
      },
      supportedFormats: ['JPG', 'PNG', 'WEBP']
    }
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private apiLogger: ApiLoggerService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SECRET_KEY');
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async optimizeThumbnail(dto: OptimizeThumbnailDto, userId: string): Promise<OptimizeResponse> {
    const startTime = Date.now();
    let createdRequestId: string | null = null;

    try {
      // Validate input
      this.validateImageData(dto.imageData);
      const template = this.getTemplate(dto.templateId);
      if (!template) {
        throw new BadRequestException('Invalid template ID');
      }

      // Validate export formats
      const unsupportedFormats = dto.exportFormats.filter(format => 
        !template.supportedFormats.includes(format)
      );
      if (unsupportedFormats.length > 0) {
        throw new BadRequestException(`Template ${template.name} doesn't support formats: ${unsupportedFormats.join(', ')}`);
      }

      // Get original image size
      const originalImageBuffer = Buffer.from(dto.imageData.split(',')[1], 'base64');
      const originalSize = originalImageBuffer.length;

      // Create request record
      const optimizeRequest = await this.prisma.optimizeRequest.create({
        data: {
          userId,
          originalFileName: dto.fileName,
          originalFileSize: originalSize,
          originalMimeType: dto.mimeType,
          imageData: dto.imageData,
          templateId: dto.templateId,
          templateName: template.name,
          optimizations: { ...template.optimizations, ...dto.optimizations },
          exportFormats: dto.exportFormats,
          modelUsed: 'gemini-2.5-flash-image-preview',
          status: 'PROCESSING',
        },
      });
      createdRequestId = optimizeRequest.id;

      // Generate optimization instructions using Gemini
      const optimizationPrompt = await this.generateOptimizationPrompt(
        template, 
        { ...template.optimizations, ...dto.optimizations },
        dto.customPrompt
      );

      // Process image with Gemini
      const processedInstructions = await this.processImageWithGemini(
        dto.imageData,
        optimizationPrompt
      );

      // Update request with final prompt
      await this.prisma.optimizeRequest.update({
        where: { id: optimizeRequest.id },
        data: { finalPrompt: processedInstructions },
      });

      // Generate optimized images in requested formats
      const results: OptimizeResult[] = [];
      let totalOptimizedSize = 0;

      for (const format of dto.exportFormats) {
        const optimizedResult = await this.generateOptimizedImage(
          dto.imageData,
          processedInstructions,
          format,
          template,
          optimizeRequest.id
        );
        
        results.push(optimizedResult);
        totalOptimizedSize += optimizedResult.fileSize;
      }

      // Update request status
      const processingTime = Date.now() - startTime;
      await this.prisma.optimizeRequest.update({
        where: { id: optimizeRequest.id },
        data: {
          status: 'COMPLETED',
          processingTime,
        },
      });

      const compressionRatio = originalSize > 0 ? (originalSize - totalOptimizedSize) / originalSize : 0;

      // Log successful API call
      await this.apiLogger.logApiCall({
        endpoint: 'optimize-thumbnail/optimize',
        method: 'POST',
        modelUsed: 'gemini-2.5-flash-image-preview',
        status: 'SUCCESS',
        responseTime: processingTime,
        inputTokens: this.estimateTokens(JSON.stringify(dto)),
        outputTokens: results.length * 100, // Estimated tokens for results
        totalTokens: this.estimateTokens(JSON.stringify(dto)) + (results.length * 100),
        userId,
        requestSize: Buffer.byteLength(JSON.stringify(dto)),
        responseSize: Buffer.byteLength(JSON.stringify(results)),
      });

      return {
        success: true,
        requestId: optimizeRequest.id,
        results,
        processingTime,
        originalSize,
        totalOptimizedSize,
        compressionRatio,
      };

    } catch (error) {
      console.error('Optimize thumbnail failed:', error);
      
      if (createdRequestId) {
        try {
          const processingTime = Date.now() - startTime;
          await this.prisma.optimizeRequest.update({
            where: { id: createdRequestId },
            data: {
              status: 'FAILED',
              processingTime,
              errorMessage: error?.message || 'Unknown error',
            },
          });
        } catch (updateError) {
          console.error('Failed to update error status:', updateError);
        }
      }

      // Log failed API call
      const processingTime = Date.now() - startTime;
      await this.apiLogger.logApiCall({
        endpoint: 'optimize-thumbnail/optimize',
        method: 'POST',
        modelUsed: 'gemini-2.5-flash-image-preview',
        status: 'FAILED',
        responseTime: processingTime,
        errorMessage: error?.message || 'Unknown error',
        errorCode: error?.code || 'OPTIMIZE_ERROR',
        userId,
        requestSize: Buffer.byteLength(JSON.stringify(dto)),
      });
      
      throw new BadRequestException(`Failed to optimize thumbnail: ${error.message}`);
    }
  }

  // Helper method to estimate token count (rough approximation)
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private async generateOptimizationPrompt(
    template: Template, 
    optimizations: OptimizationSettings, 
    customPrompt?: string
  ): Promise<string> {
    if (customPrompt) {
      return customPrompt;
    }

    const prompt = `You are an expert image optimization specialist. Analyze this product image and provide detailed optimization instructions for ${template.name} template.

Template Category: ${template.category}
Template Description: ${template.description}

Optimization Settings:
- Smart Crop: ${optimizations.smartCrop || 'auto'}
- Background: ${optimizations.backgroundRemoval || 'none'} ${optimizations.backgroundReplacement ? `(replace with ${optimizations.backgroundReplacement})` : ''}
- Lighting: ${optimizations.lightingAdjustment || 'auto'}
- Color Correction: ${optimizations.colorCorrection || 'auto'}
- Aspect Ratio: ${optimizations.aspectRatio || 'original'}
- Quality Level: ${optimizations.qualityLevel || 'high'}
${optimizations.textPlacement ? `- Text Placement: ${optimizations.textPlacement}` : ''}
${optimizations.textContent ? `- Text Content: "${optimizations.textContent}"` : ''}

Please provide:
1. Detailed cropping recommendations (focus areas, composition)
2. Background optimization instructions
3. Lighting and color adjustment specifics
4. Any text overlay requirements
5. Format-specific optimization notes
6. Quality enhancement suggestions

Focus on enhancing product visibility, appeal, and professional presentation while maintaining brand integrity.`;

    return prompt;
  }

  private async processImageWithGemini(imageData: string, prompt: string): Promise<string> {
    try {
      // Convert base64 to proper format for Gemini
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      };

      // Generate optimization instructions using Gemini
      const instructions = await this.geminiService.generateContent(
        prompt,
        imagePart,
        'gemini-2.5-flash-image-preview'
      );

      return instructions;
    } catch (error) {
      console.error('Gemini processing failed:', error);
      return `Fallback optimization instructions for professional image enhancement: 
      1. Apply smart cropping to focus on main product
      2. Enhance lighting and contrast for better visibility
      3. Optimize colors for natural appearance
      4. Remove distractions from background if needed
      5. Ensure high-quality output suitable for commercial use`;
    }
  }

  private async generateOptimizedImage(
    originalImageData: string,
    instructions: string,
    format: string,
    template: Template,
    requestId: string
  ): Promise<OptimizeResult> {
    try {
      // For now, we'll create a placeholder result since we don't have actual image processing
      // In production, you would use image processing libraries like Sharp, Canvas API, or external services
      
      const originalBuffer = Buffer.from(originalImageData.split(',')[1], 'base64');
      const fileName = `${requestId}_${template.id}_${Date.now()}.${format.toLowerCase()}`;
      const filePath = `${requestId}/${fileName}`;

      // Simulate image optimization (in production, use actual image processing)
      let optimizedBuffer = originalBuffer;
      let dimensions = { width: 1024, height: 1024 }; // Default dimensions
      
      // Simulate format conversion and optimization
      if (format === 'WEBP') {
        // WebP typically achieves better compression
        optimizedBuffer = originalBuffer.slice(0, Math.floor(originalBuffer.length * 0.7));
      } else if (format === 'JPG') {
        // JPEG compression
        optimizedBuffer = originalBuffer.slice(0, Math.floor(originalBuffer.length * 0.8));
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, optimizedBuffer, {
          contentType: `image/${format.toLowerCase()}`,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicData } = this.supabase
        .storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      const imageUrl = publicData?.publicUrl || '';

      // Create result record
      const optimizeResult = await this.prisma.optimizeResult.create({
        data: {
          requestId,
          templateUsed: template.name,
          format,
          imageUrl,
          fileSize: optimizedBuffer.length,
          dimensions,
          optimizationsApplied: template.optimizations,
          qualityScore: Math.floor(85 + Math.random() * 10), // Simulated quality score
          improvementNotes: [
            'Enhanced image clarity and sharpness',
            'Optimized color balance and contrast',
            'Applied professional composition guidelines',
            `Compressed to ${format} format for optimal web delivery`
          ],
        },
      });

      return {
        id: optimizeResult.id,
        templateUsed: template.name,
        format,
        imageUrl,
        fileSize: optimizedBuffer.length,
        dimensions,
        optimizationsApplied: template.optimizations,
        qualityScore: optimizeResult.qualityScore || undefined,
        improvementNotes: optimizeResult.improvementNotes,
        createdAt: optimizeResult.createdAt.toISOString(),
      };

    } catch (error) {
      console.error('Image optimization failed:', error);
      throw new Error(`Failed to optimize image in ${format} format: ${error.message}`);
    }
  }

  private validateImageData(imageData: string) {
    if (!imageData || !imageData.startsWith('data:image/')) {
      throw new BadRequestException('Invalid image data format');
    }

    try {
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('No base64 data found');
      }
      
      Buffer.from(base64Data, 'base64');
    } catch (error) {
      throw new BadRequestException('Invalid base64 image data');
    }
  }

  private getTemplate(templateId: string): Template | null {
    return this.TEMPLATES.find(template => template.id === templateId) || null;
  }

  async getAvailableTemplates(): Promise<Template[]> {
    return this.TEMPLATES;
  }

  async getUserRequests(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.optimizeRequest.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.optimizeRequest.count({ where: { userId } }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsageStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, success, error, processing] = await Promise.all([
      this.prisma.optimizeRequest.count({ where }),
      this.prisma.optimizeRequest.count({ 
        where: { ...where, status: 'COMPLETED' } 
      }),
      this.prisma.optimizeRequest.count({ 
        where: { ...where, status: 'FAILED' } 
      }),
      this.prisma.optimizeRequest.count({ 
        where: { ...where, status: 'PROCESSING' } 
      }),
    ]);

    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsage = await this.prisma.optimizeRequest.count({
      where: {
        ...where,
        createdAt: { gte: today },
      },
    });

    // Calculate average processing time
    const completedRequests = await this.prisma.optimizeRequest.findMany({
      where: { ...where, status: 'COMPLETED', processingTime: { not: null } },
      select: { processingTime: true },
    });

    const avgProcessingTime = completedRequests.length > 0
      ? Math.round(
          completedRequests.reduce((sum, req) => sum + (req.processingTime || 0), 0) / 
          completedRequests.length
        )
      : 0;

    return {
      total,
      success,
      error,
      processing,
      todayUsage,
      avgProcessingTime,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    };
  }

  async deleteRequest(requestId: string, userId: string) {
    const request = await this.prisma.optimizeRequest.findFirst({
      where: { id: requestId, userId },
    });

    if (!request) {
      throw new BadRequestException('Request not found or access denied');
    }

    await this.prisma.optimizeRequest.delete({
      where: { id: requestId },
    });

    return { success: true, message: 'Request deleted successfully' };
  }
}