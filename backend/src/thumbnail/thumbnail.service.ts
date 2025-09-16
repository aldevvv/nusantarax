import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GenerateThumbnailDto,
  ThumbnailGenerationResult,
  GenerationResponse
} from './dto/generate-thumbnail.dto';
import { ThumbnailPaginationDto } from './dto/thumbnail-pagination.dto';
import { GeminiService } from '../gemini/gemini.service';
import { LunosService } from '../lunos/lunos.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GenerateThumbnailFromBriefDto, BuiltPromptDTO } from './dto/generate-thumbnail-from-brief.dto';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  basePrompt: string;
  variations: string[];
}

@Injectable()
export class ThumbnailService {
  private genAI: GoogleGenerativeAI;
  private readonly MODEL_ID = 'gemini-2.0-flash-preview-image-generation';
  private supabase: SupabaseClient;
  private readonly STORAGE_BUCKET = 'thumbnails';
  private readonly LUNOS_IMAGE_MODEL = 'google-imagen-4.0';
  private lunosEditModel: string;

  // Hardcoded prompt templates
  private readonly PROMPT_TEMPLATES: PromptTemplate[] = [
    {
      id: 'ecommerce-shot',
      title: 'E-commerce Product Shot',
      description: 'Professional product photography for online stores',
      basePrompt: 'Analyze this product image and create a professional e-commerce thumbnail description.',
      variations: [
        'Focus on creating a clean, professional product shot with white background that highlights the product features and quality for online marketplace.',
        'Generate an eye-catching e-commerce thumbnail that emphasizes product benefits and creates buying desire with professional lighting setup.',
        'Create a premium product showcase description that would work perfectly for high-end e-commerce platforms with emphasis on luxury appeal.'
      ]
    },
    {
      id: 'social-media',
      title: 'Social Media Thumbnail',
      description: 'Eye-catching thumbnail for social platforms',
      basePrompt: 'Analyze this product and create engaging social media thumbnail concepts.',
      variations: [
        'Design a vibrant, scroll-stopping social media thumbnail that creates instant engagement and encourages shares with dynamic composition.',
        'Create an Instagram-worthy product showcase that tells a story and connects emotionally with the audience using trending visual styles.',
        'Generate a social media thumbnail concept that maximizes engagement with bold colors, creative angles, and lifestyle integration.'
      ]
    },
    {
      id: 'catalog-image',
      title: 'Professional Catalog Image',
      description: 'High-quality catalog-style product image',
      basePrompt: 'Analyze this product for creating professional catalog imagery.',
      variations: [
        'Create a sophisticated catalog-style product presentation with detailed feature highlights and professional studio lighting setup.',
        'Design a premium catalog image concept that showcases product craftsmanship and quality with elegant, minimalist composition.',
        'Generate a high-end catalog thumbnail that emphasizes product specifications and premium materials with professional photography standards.'
      ]
    }
  ];

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private lunosService: LunosService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SECRET_KEY');
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    // Edit-capable model (default to DALL·E 3)
    this.lunosEditModel = this.configService.get<string>('LUNOS_IMAGE_EDIT_MODEL') || 'openai/dall-e-3';
  }

  async generateThumbnails(generateDto: GenerateThumbnailDto, userId: string) {
    const startTime = Date.now();
    let createdRequestId: string | null = null;
    try {
      // Validate image data
      this.validateImageData(generateDto.imageData);

      // Get prompt template
      const promptTemplate = this.getPromptTemplate(generateDto.promptId);
      if (!promptTemplate) {
        throw new BadRequestException('Invalid prompt ID');
      }

      // Create request record
      const thumbnailRequest = await this.prisma.thumbnailRequest.create({
        data: {
          userId,
          originalFileName: generateDto.fileName,
          originalFileSize: generateDto.fileSize,
          originalMimeType: generateDto.mimeType,
          imageData: generateDto.imageData,
          promptId: generateDto.promptId,
          promptText: promptTemplate.basePrompt,
          modelUsed: this.lunosEditModel,
          status: 'PROCESSING',
        },
      });
      createdRequestId = thumbnailRequest.id;

      // Generate images with Lunos edit-capable model
      let results = await this.processImageWithLunos(
        generateDto.imageData,
        promptTemplate,
        thumbnailRequest.id
      );

      // Enforce hard failure when no images were produced
      if (!results || results.length < 3) {
        const processingTime = Date.now() - startTime;
        await this.prisma.thumbnailRequest.update({
          where: { id: thumbnailRequest.id },
          data: {
            status: 'FAILED',
            processingTime,
            errorMessage: `Generated ${results?.length || 0} images; expected 3`,
          },
        });
        throw new BadRequestException('Failed to generate all thumbnail edits');
      }

      // Update request status
      const processingTime = Date.now() - startTime;
      await this.prisma.thumbnailRequest.update({
        where: { id: thumbnailRequest.id },
        data: {
          status: 'COMPLETED',
          processingTime,
        },
      });

      return {
        success: true,
        requestId: thumbnailRequest.id,
        results,
        processingTime,
        note: undefined,
      };
    } catch (error) {
      // Update request with error if it was created
      console.error('Thumbnail generation failed:', error);
      try {
        const processingTime = Date.now() - startTime;
        if (createdRequestId) {
          await this.prisma.thumbnailRequest.update({
            where: { id: createdRequestId },
            data: {
              status: 'FAILED',
              processingTime,
              errorMessage: error?.message || 'Unknown error',
            },
          });
        }
      } catch {}
      throw new BadRequestException(
        `Failed to generate thumbnails: ${error.message}`
      );
    }
  }

  private async processImageWithLunos(
    imageData: string,
    promptTemplate: PromptTemplate,
    requestId: string
  ): Promise<ThumbnailGenerationResult[]> {
    const results: ThumbnailGenerationResult[] = [];

    try {
      if (!this.supabase) {
        console.error('Supabase client is not configured');
        return results;
      }

      // Edit the uploaded image according to the selected style to produce 3 results
      for (let i = 0; i < 3; i++) {
        const editPrompt = `${promptTemplate.basePrompt}\n\n${promptTemplate.variations[i]}\n\nEdit the uploaded product photo accordingly for a professional ${promptTemplate.title.toLowerCase()} result.\nConstraints: preserve the exact product identity (shape, label, brand, color); do not replace or change the product. Improve lighting, contrast, and clarity. Adjust background and scene per variation. Keep realistic shadows. Output square 1024x1024.`;

        let b64: string | null = null;
        try {
          b64 = await this.lunosService.editImageBase64(
            imageData,
            editPrompt,
            this.lunosEditModel,
            '1024x1024',
          );
        } catch (e) {
          console.error('Lunos image edit failed:', e);
          b64 = null;
        }

        if (!b64) {
          continue; // we'll backfill later
        }
        const imageBuffer = Buffer.from(b64, 'base64');
        const path = `${requestId}/variation_${i + 1}_${Date.now()}.png`;

        const upload = await this.supabase
          .storage
          .from(this.STORAGE_BUCKET)
          .upload(path, imageBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (upload.error) {
          console.error('Supabase upload failed:', upload.error);
          continue;
        }

        const { data: publicData } = this.supabase
          .storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(upload.data.path);

        const imageUrl = publicData?.publicUrl || null;

        const thumbnailResult = await this.prisma.thumbnailResult.create({
          data: {
            requestId,
            promptVariation: promptTemplate.variations[i] || `Variation ${i + 1}`,
            resultText: 'AI generated thumbnail image',
            resultOrder: i + 1,
            imageUrl: imageUrl || undefined,
          },
        });

        results.push({
          id: thumbnailResult.id,
          order: i + 1,
          promptTitle: promptTemplate.title,
          promptVariation: promptTemplate.variations[i] || `Variation ${i + 1}`,
          resultText: 'AI generated thumbnail image',
          imageUrl: imageUrl || undefined,
          createdAt: thumbnailResult.createdAt,
        });
      }

      // Do not backfill with text; let caller enforce minimum

    } catch (error) {
      console.error('Critical error in processImageWithLunos:', error);
      throw new BadRequestException('Image editing failed');
    }

    return results;
  }

  private async processImageWithGemini(
    imageData: string,
    promptTemplate: PromptTemplate,
    requestId: string
  ): Promise<ThumbnailGenerationResult[]> {
    const results: ThumbnailGenerationResult[] = [];

    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL_ID });

      // Convert base64 to proper format for Gemini
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg', // Will detect proper mime type in production
        },
      };

      // Generate 3 different thumbnail concepts using failover
      for (let i = 0; i < 3; i++) {
        const fullPrompt = `${promptTemplate.basePrompt}

${promptTemplate.variations[i]}

Please provide:
1. A detailed description of the optimal thumbnail concept
2. Specific styling recommendations
3. Key visual elements to emphasize
4. Technical photography/editing suggestions

Format your response as a comprehensive thumbnail creation guide.`;

        // TEMPORARY: Skip API calls and directly use enhanced fallback results
        console.log(`Creating enhanced fallback result ${i + 1} (API quota protection)...`);
        const fallbackResult = await this.createFallbackResult(
          requestId,
          promptTemplate,
          i + 1
        );
        results.push(fallbackResult);
        console.log(`Enhanced fallback result ${i + 1} created successfully`);
      }

      // Ensure we always have 3 results
      while (results.length < 3) {
        const fallbackResult = await this.createFallbackResult(
          requestId,
          promptTemplate,
          results.length + 1
        );
        results.push(fallbackResult);
      }

    } catch (error) {
      console.error('Critical error in processImageWithGemini:', error);
      
      // Create fallback results for critical errors
      for (let i = 0; i < 3; i++) {
        const fallbackResult = await this.createFallbackResult(
          requestId,
          promptTemplate,
          i + 1
        );
        results.push(fallbackResult);
      }
    }

    return results;
  }

  private async createFallbackResult(
    requestId: string,
    promptTemplate: PromptTemplate,
    order: number
  ): Promise<ThumbnailGenerationResult> {
    const fallbackTexts = [
      `Professional ${promptTemplate.title.toLowerCase()} concept: Create a clean, well-lit product showcase that emphasizes quality and appeal. Focus on optimal composition with attention to detail and visual hierarchy.`,
      `Enhanced ${promptTemplate.title.toLowerCase()} approach: Develop a compelling visual narrative that highlights product benefits and creates emotional connection with viewers through strategic styling and presentation.`,
      `Premium ${promptTemplate.title.toLowerCase()} execution: Design a sophisticated product display that communicates excellence and craftsmanship through professional lighting, composition, and visual storytelling techniques.`
    ];

    const thumbnailResult = await this.prisma.thumbnailResult.create({
      data: {
        requestId,
        promptVariation: promptTemplate.variations[order - 1] || `Variation ${order}`,
        resultText: fallbackTexts[order - 1],
        resultOrder: order,
      },
    });

    return {
      id: thumbnailResult.id,
      order,
      promptTitle: promptTemplate.title,
      promptVariation: promptTemplate.variations[order - 1] || `Variation ${order}`,
      resultText: fallbackTexts[order - 1],
      createdAt: thumbnailResult.createdAt,
    };
  }

  private async createEmergencyFallbackResults(
    requestId: string,
    promptTemplate: PromptTemplate
  ): Promise<ThumbnailGenerationResult[]> {
    const fallbackResults: ThumbnailGenerationResult[] = [];

    for (let i = 0; i < 3; i++) {
      const fallbackResult = await this.createFallbackResult(
        requestId,
        promptTemplate,
        i + 1
      );
      fallbackResults.push(fallbackResult);
    }

    return fallbackResults;
  }

  private validateImageData(imageData: string) {
    if (!imageData || !imageData.startsWith('data:image/')) {
      throw new BadRequestException('Invalid image data format');
    }

    // Check if it's a valid base64 image
    try {
      const base64Data = imageData.split(',')[1];
      if (!base64Data) {
        throw new Error('No base64 data found');
      }
      
      // Validate base64 format
      Buffer.from(base64Data, 'base64');
    } catch (error) {
      throw new BadRequestException('Invalid base64 image data');
    }
  }

  private getPromptTemplate(promptId: string): PromptTemplate | null {
    return this.PROMPT_TEMPLATES.find(template => template.id === promptId) || null;
  }

  // New flow: build prompt with Gemini then generate with Imagen
  async generateFromBrief(dto: GenerateThumbnailFromBriefDto, userId: string) {
    const start = Date.now();
    if (!this.supabase) throw new BadRequestException('Storage not configured');

    // 1) Build strict JSON prompt with Gemini
    const count = dto.count && dto.count >= 1 && dto.count <= 10 ? dto.count : 3;
    const width = dto.width || 1080;
    const height = dto.height || 1350;
    const styleParam: 'vivid' | 'natural' = dto.tone || (['lifestyle_vibrant', 'tech_modern'].includes(dto.stylePreset || '') ? 'vivid' : 'natural');

    // If user provided final prompt override, use it; else build with Gemini
    let finalPrompt = (dto.finalPromptOverride || '').trim();
    let negative = 'no text overlays, no watermarks, no humans, no deformed logos, no misspelled labels, no brand misuse, no artifacts, no low-res, in-frame';
    let style = styleParam;
    let outW = width;
    let outH = height;
    let outCount = count;

    let built: BuiltPromptDTO | null = null;
    if (!finalPrompt) {
      const schemaKeys = `{"final_prompt":"string","negative_prompt":"string","style":{"preset":"string","style_param":"vivid|natural"},"product":{"name":"string","category":"string","description":"string","packaging":"string","color_material":"string","branding_constraints":"string"},"scene":{"background":"string","environment":"string","surface":"string","props":["string"]},"camera":{"framing":"close|mid|wide","angle":"eye|45|top","lens_equivalent":"50mm|85mm","depth_of_field":"shallow|deep"},"lighting":{"type":"string","qualities":["string"],"mood":"string"},"composition":{"centered":true,"rule_of_thirds":true,"negative_space":"string"},"colors":{"palette":["#FFFFFF"],"background_color":"#FFFFFF","accent_colors":["#000000"]},"output":{"width":1080,"height":1350,"count":3,"quality":"hd"}}`;

      const buildPrompt = `You are a product photography prompt engineer. Create a STRICT JSON object (no markdown fences) following this flat JSON shape: ${schemaKeys}.
Requirements:\n- Platform: ${dto.platform || 'ecommerce'}; Style preset: ${dto.stylePreset || 'ecommerce_white'}; Background: ${dto.background || 'white'}.\n- Tone: ${styleParam}; Framing: ${dto.framing || 'mid'}; Angle: ${dto.angle || 'eye'}; Lighting: ${dto.lighting || 'studio softbox'}.\n- Color palette: ${(dto.palette && dto.palette.length) ? dto.palette.join(',') : 'auto based on preset'}.\n- Product name: ${dto.productName}.\n- Product category: ${dto.productCategory || ''}.\n- Description: ${dto.productDescription}.\n- Packaging: ${dto.packaging || ''}.\n- Notes: ${dto.notes || ''}.\n- Build final_prompt as a compact paragraph (<=220 words) including product identity, setting/background/surface, lighting, framing/angle, texture/material, color mood, composition, and style intent.\n- negative_prompt must include at least: text overlays, watermarks, human/hands, deformed logos, misspelled labels, NSFW, brand misuse, artifacts, low-res, out-of-frame.\n- Map style_param: vivid for lifestyle_vibrant or tech_modern; natural otherwise.\n- output: width ${width}, height ${height}, count ${count}, quality hd.\nReturn JSON only.`;

      const geminiText = await this.geminiService.generateContent(buildPrompt);
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new BadRequestException('Gemini did not return JSON');
      try { built = JSON.parse(jsonMatch[0]); } catch { throw new BadRequestException('Invalid JSON from Gemini'); }

      const builtData = built as BuiltPromptDTO; // assert not null after parse
      finalPrompt = builtData.final_prompt || `${dto.productName} product photo`;
      negative = builtData.negative_prompt || negative;
      style = (builtData.style?.style_param as 'vivid' | 'natural') || styleParam;
      outW = builtData.output?.width || width;
      outH = builtData.output?.height || height;
      outCount = builtData.output?.count || count;
    }

    // 2) Persist request row first
    const briefData: any = { ...dto, built: built ?? undefined };
    const request = await this.prisma.thumbnailRequest.create({
      data: {
        userId,
        originalFileName: null,
        originalFileSize: null,
        originalMimeType: null,
        imageData: null,
        brief: briefData as any,
        promptId: dto.stylePreset || 'brief',
        promptText: finalPrompt,
        finalPrompt,
        modelUsed: 'google-imagen-4.0',
        status: 'PROCESSING',
      }
    });

    // 3) Generate images via Lunos Imagen 4.0
    const promptsCombined = `${finalPrompt}\nExclude: ${negative}`;
    const b64s = await this.lunosService.generateImageBase64WithSize(
      promptsCombined,
      'google-imagen-4.0',
      outW,
      outH,
      { style, n: outCount, quality: 'hd' }
    );

    if (!b64s || b64s.length === 0) {
      await this.prisma.thumbnailRequest.update({ where: { id: request.id }, data: { status: 'FAILED', errorMessage: 'No images generated' } });
      throw new BadRequestException('Image generation failed');
    }

    // 4) Upload and persist results
    const results: ThumbnailGenerationResult[] = [];
    for (let i = 0; i < b64s.length; i++) {
      const imageBuffer = Buffer.from(b64s[i], 'base64');
      const path = `${request.id}/brief_${i + 1}_${Date.now()}.png`;
      const upload = await this.supabase.storage.from(this.STORAGE_BUCKET).upload(path, imageBuffer, { contentType: 'image/png', upsert: true });
      if (upload.error) throw new BadRequestException(`Upload failed: ${upload.error.message}`);
      const { data: pub } = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(upload.data.path);
      const imageUrl = pub?.publicUrl || '';

      const rec = await this.prisma.thumbnailResult.create({
        data: {
          requestId: request.id,
          promptVariation: dto.stylePreset || 'brief',
          resultText: 'AI generated thumbnail image',
          resultOrder: i + 1,
          imageUrl,
        }
      });
      results.push({ id: rec.id, order: rec.resultOrder, promptTitle: dto.productName, promptVariation: dto.stylePreset || 'brief', resultText: 'AI generated thumbnail image', createdAt: rec.createdAt, imageUrl });
    }

    if (results.length < (outCount || 3)) {
      await this.prisma.thumbnailRequest.update({ where: { id: request.id }, data: { status: 'FAILED', processingTime: Date.now() - start, errorMessage: `Only ${results.length} images generated` } });
      throw new BadRequestException('Failed to generate requested number of images');
    }

    await this.prisma.thumbnailRequest.update({ where: { id: request.id }, data: { status: 'COMPLETED', processingTime: Date.now() - start } });

    return { requestId: request.id, results, processingTime: Date.now() - start, finalPrompt };
  }

  async getAvailablePrompts() {
    return this.PROMPT_TEMPLATES.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
    }));
  }

  async getUserRequests(userId: string, pagination: ThumbnailPaginationDto) {
    const { page = 1, limit = 10, status, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { originalFileName: { contains: search, mode: 'insensitive' } },
        { promptText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      this.prisma.thumbnailRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            orderBy: { resultOrder: 'asc' },
          },
        },
      }),
      this.prisma.thumbnailRequest.count({ where }),
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
      this.prisma.thumbnailRequest.count({ where }),
      this.prisma.thumbnailRequest.count({ 
        where: { ...where, status: 'COMPLETED' } 
      }),
      this.prisma.thumbnailRequest.count({ 
        where: { ...where, status: 'FAILED' } 
      }),
      this.prisma.thumbnailRequest.count({ 
        where: { ...where, status: 'PROCESSING' } 
      }),
    ]);

    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsage = await this.prisma.thumbnailRequest.count({
      where: {
        ...where,
        createdAt: { gte: today },
      },
    });

    // Calculate average processing time
    const completedRequests = await this.prisma.thumbnailRequest.findMany({
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
      avgProcessingTime, // in milliseconds
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    };
  }

  async deleteRequest(requestId: string, userId: string) {
    const request = await this.prisma.thumbnailRequest.findFirst({
      where: { id: requestId, userId },
    });

    if (!request) {
      throw new BadRequestException('Request not found or access denied');
    }

    await this.prisma.thumbnailRequest.delete({
      where: { id: requestId },
    });

    return { success: true, message: 'Request deleted successfully' };
  }
}
