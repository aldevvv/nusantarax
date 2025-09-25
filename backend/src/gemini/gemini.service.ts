import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { ApiCallStatus } from '@prisma/client';

interface CachedModels {
  data: any[];
  timestamp: number;
  ttl: number;
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;
  private modelsCache: CachedModels | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private currentApiKey: string | null = null; // Track current API key for updates

  constructor(
    private configService: ConfigService,
    private apiLogger: ApiLoggerService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
      this.currentApiKey = apiKey;
    }
  }

  private getCurrentApiKey(): string | null {
    // Return updated key if available, otherwise fall back to config
    return this.currentApiKey || this.configService.get('GEMINI_API_KEY') || null;
  }

  private validateApiKeyFormat(apiKey: string): boolean {
    // Google Gemini API keys start with "AIzaSy" and are 39 characters long
    const geminiKeyPattern = /^AIzaSy[a-zA-Z0-9_-]{33}$/;
    return geminiKeyPattern.test(apiKey);
  }

  async checkApiKeyStatus() {
    const apiKey = this.getCurrentApiKey();
    
    if (!apiKey) {
      return {
        isValid: false,
        message: 'No API key configured',
        apiKey: null
      };
    }

    // Validate API key format instead of making API requests
    const isValidFormat = this.validateApiKeyFormat(apiKey);
    
    return {
      isValid: isValidFormat,
      message: isValidFormat ? 'API key format is valid' : 'Invalid API key format',
      apiKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      note: 'Format validation only - no API requests made to preserve quota',
      source: this.currentApiKey ? 'updated' : 'environment'
    };
  }

  async getAvailableModels() {
    const apiKey = this.getCurrentApiKey();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    // Validate API key format first
    const isValidFormat = this.validateApiKeyFormat(apiKey);
    
    if (!isValidFormat) {
      throw new BadRequestException('Invalid API key format');
    }

    // Check if we have valid cached data
    if (this.modelsCache && this.isCacheValid(this.modelsCache)) {
      return {
        models: this.modelsCache.data,
        source: 'cache',
        timestamp: new Date(this.modelsCache.timestamp).toISOString()
      };
    }

    try {
      // Try to fetch fresh data from API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        // If quota exceeded, return cached data or fallback
        if (response.status === 429) {
          if (this.modelsCache) {
            // Return expired cache if available
            return {
              models: this.modelsCache.data,
              source: 'expired_cache',
              message: 'API quota exceeded, using cached data',
              timestamp: new Date(this.modelsCache.timestamp).toISOString()
            };
          }
          // Otherwise return known good fallback data
          return {
            models: this.getFallbackModels(),
            source: 'fallback',
            message: 'API quota exceeded, using fallback data'
          };
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the models from the API response
      const models = data.models?.map((model: any) => ({
        name: model.name?.replace('models/', ''),
        displayName: model.displayName || model.name?.replace('models/', ''),
        available: true,
        description: model.description || 'Google Gemini AI model',
        supportedGenerationMethods: model.supportedGenerationMethods || [],
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit
      })) || [];

      // Filter only models that support generateContent
      const generativeModels = models.filter((model: any) =>
        model.supportedGenerationMethods.includes('generateContent')
      );

      // Cache the successful response
      this.modelsCache = {
        data: generativeModels,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      };

      return {
        models: generativeModels,
        source: 'api',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // If we have cached data (even expired), use it
      if (this.modelsCache) {
        return {
          models: this.modelsCache.data,
          source: 'expired_cache',
          message: `API error: ${error.message}`,
          timestamp: new Date(this.modelsCache.timestamp).toISOString()
        };
      }
      
      // Otherwise use fallback
      if (error.message.includes('429') || error.message.includes('quota')) {
        return {
          models: this.getFallbackModels(),
          source: 'fallback',
          message: 'API quota exceeded, using fallback data'
        };
      }
      
      throw new BadRequestException(`Failed to fetch models: ${error.message}`);
    }
  }

  private isCacheValid(cache: CachedModels): boolean {
    return Date.now() - cache.timestamp < cache.ttl;
  }

  // Helper method to get the best model for text generation
  private async getBestTextModel(): Promise<string> {
    // 🔧 HARDCODED: Always use gemini-2.5-pro for text analysis
    return 'gemini-2.5-pro';
  }

  // Helper method to get the best model for image analysis
  private async getBestImageModel(): Promise<string> {
    // 🔧 HARDCODED: Always use gemini-2.5-pro for image analysis
    return 'gemini-2.5-pro';
  }

  // Helper method to get models for consensus generation
  private async getConsensusModels(): Promise<string[]> {
    // 🔧 HARDCODED: Use gemini-2.5-pro for consensus
    return ['gemini-2.5-pro'];
  }

  private async getFallbackModels() {
    // Minimal fallback - these should be updated based on actual API response
    // This is only used when both cache and API are completely unavailable
    return [
      {
        name: 'gemini-pro',
        displayName: 'Gemini Pro',
        available: true,
        description: 'Fallback model when API is unavailable',
        supportedGenerationMethods: ['generateContent'],
        inputTokenLimit: 30720,
        outputTokenLimit: 2048
      }
    ];
  }

  async checkUsage() {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    try {
      return {
        totalRequests: 0,
        totalTokens: 0,
        monthlyQuota: 'Unlimited',
        currentPeriod: new Date().toISOString().substring(0, 7),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch usage: ${error.message}`);
    }
  }

  async testApiKey(newApiKey: string) {
    try {
      // Validate API key format first
      const isValidFormat = this.validateApiKeyFormat(newApiKey);
      
      if (!isValidFormat) {
        return {
          isValid: false,
          message: 'Invalid API key format. Gemini API keys should start with "AIzaSy" and be 39 characters long.',
          details: {
            format: 'invalid',
            expectedPattern: 'AIzaSy + 33 characters'
          }
        };
      }

      // Try to fetch models with the new API key (minimal quota usage)
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${newApiKey}`);
        
        if (!response.ok) {
          if (response.status === 429) {
            return {
              isValid: true,
              message: 'API key format is valid, but quota exceeded. Key appears to be working.',
              details: {
                format: 'valid',
                apiStatus: 'quota_exceeded',
                note: 'This suggests the key is valid but has reached its limits'
              }
            };
          }
          
          return {
            isValid: false,
            message: `API key rejected by server: ${response.status} ${response.statusText}`,
            details: {
              format: 'valid',
              apiStatus: 'rejected',
              statusCode: response.status
            }
          };
        }
        
        const data = await response.json();
        const modelCount = data.models?.length || 0;
        
        return {
          isValid: true,
          message: `API key is valid and working! Found ${modelCount} available models.`,
          details: {
            format: 'valid',
            apiStatus: 'working',
            modelCount,
            apiKey: `${newApiKey.substring(0, 8)}...${newApiKey.substring(newApiKey.length - 4)}`
          }
        };
      } catch (apiError) {
        // If API fails but format is good, still consider it potentially valid
        return {
          isValid: true,
          message: 'API key format is valid, but could not verify with API due to network/quota issues.',
          details: {
            format: 'valid',
            apiStatus: 'unknown',
            error: apiError.message,
            note: 'Format validation passed, API test failed'
          }
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: `Error validating API key: ${error.message}`,
        details: {
          format: 'unknown',
          error: error.message
        }
      };
    }
  }

  async updateApiKeyLegacy(newApiKey: string) {
    // Test the new API key first
    const testResult = await this.testApiKey(newApiKey);
    
    if (!testResult.isValid) {
      throw new BadRequestException(testResult.message);
    }

    // Update the current API key in memory
    this.currentApiKey = newApiKey;
    this.genAI = new GoogleGenAI({ apiKey: newApiKey });
    
    // Clear cache to force refresh with new key
    this.modelsCache = null;
    
    return {
      success: true,
      message: 'API key updated successfully in memory.',
      currentApiKey: `${newApiKey.substring(0, 8)}...${newApiKey.substring(newApiKey.length - 4)}`,
      note: 'Key updated for this session. To persist permanently, update GEMINI_API_KEY in your .env file and restart the server.',
      testResult: testResult.details
    };
  }

  // Simplified Gemini API call using .env API key only
  async generateContentWithFailover(prompt: string, imagePart?: any, modelId?: string, userId?: string): Promise<string> {
    const apiKey = this.getCurrentApiKey();
    const startTime = Date.now();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured. Please set GEMINI_API_KEY in your .env file.');
    }

    const genAI = new GoogleGenAI({ apiKey });
    // Use hardcoded model for consistency
    const chosenModel = modelId || 'gemini-2.5-pro';

    try {
      const contents = imagePart ? [prompt, imagePart] : prompt;
      const result = await genAI.models.generateContent({
        model: chosenModel,
        contents: contents
      });
      const responseTime = Date.now() - startTime;
      const responseText = result.text || '';

      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      // Log successful API call
      await this.apiLogger.logApiCall({
        endpoint: 'gemini/generateContent',
        method: 'POST',
        modelUsed: chosenModel,
        status: 'SUCCESS' as any,
        responseTime,
        inputTokens: this.estimateTokens(prompt),
        outputTokens: this.estimateTokens(responseText),
        totalTokens: this.estimateTokens(prompt) + this.estimateTokens(responseText),
        userId: userId || 'system', // Provide fallback for required field
        requestSize: Buffer.byteLength(JSON.stringify({ prompt, imagePart: !!imagePart })),
        responseSize: Buffer.byteLength(responseText),
      });

      return responseText;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'gemini/generateContent',
        method: 'POST',
        modelUsed: chosenModel,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId: userId || 'system', // Provide fallback for required field
        requestSize: Buffer.byteLength(JSON.stringify({ prompt, imagePart: !!imagePart })),
      });

      throw error;
    }
  }

  // Simple method for direct content generation
  async generateContent(prompt: string, imagePart?: any, modelId?: string, userId?: string): Promise<string> {
    return await this.generateContentWithFailover(prompt, imagePart, modelId, userId);
  }

  // Best-quality multi-model consensus generation (unlimited mode)
  async generateConsensus(
    prompt: string,
    options?: {
      imagePart?: any;
      models?: string[]; // candidate models
      judgeModel?: string; // synthesizer/judge
      userId?: string;
      instructionForJudge?: string; // guidance on output format
    }
  ): Promise<string> {
    const imagePart = options?.imagePart;
    const userId = options?.userId;
    // Use hardcoded models for consistency
    const models = options?.models || ['gemini-2.5-pro'];
    const judgeModel = options?.judgeModel || 'gemini-2.5-pro';

    // Run all candidate models in parallel
    const runs = await Promise.allSettled(
      models.map(m => this.generateContentWithFailover(prompt, imagePart, m, userId))
    );

    const successes = runs
      .map((r, i) => ({ r, i }))
      .filter(x => (x.r as any).status === 'fulfilled')
      .map(x => ({ model: models[x.i], text: (x.r as any).value as string }));

    if (successes.length === 0) {
      // Fallback to single call with default
      return await this.generateContentWithFailover(prompt, imagePart, undefined, userId);
    }

    // Synthesize with judge model
    const synthesisPrompt = `You are the judge. Combine the best parts of multiple model outputs into a single high-quality answer.\n\n` +
      successes.map((s, idx) => `Model ${idx + 1} [${s.model}]:\n${s.text}\n`).join('\n') +
      `\nInstructions:\n${options?.instructionForJudge || 'Return the best, concise result. If a JSON schema was requested, ensure strict JSON with no extra text.'}`;

    try {
      return await this.generateContentWithFailover(synthesisPrompt, undefined, judgeModel, userId);
    } catch (e) {
      // Fallback to best available candidate
      return successes[0].text;
    }
  }

  // Get real API statistics from logs
  async getApiStatistics(timeframe: 'today' | 'week' | 'month' | 'all' = 'month') {
    return await this.apiLogger.getApiStatistics(timeframe);
  }

  async getRecentErrors() {
    return await this.apiLogger.getRecentErrors();
  }

  async getModelUsageStats() {
    return await this.apiLogger.getModelUsageStats();
  }

  // Helper method to estimate token count (rough approximation)
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  // Image Generator Extensions
  
  /**
   * Analyze and enhance user prompt for image generation
   * Uses Gemini 2.5 Pro to analyze user input and create optimized prompt
   */
  async analyzeAndEnhancePrompt(
    userPrompt: string,
    businessContext?: string,
    templateContext?: string,
    userId?: string
  ): Promise<{
    enhancedPrompt: string;
    analysis: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
  }> {
    const apiKey = this.getCurrentApiKey();
    const startTime = Date.now();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    const analysisModel = 'gemini-2.5-pro'; // 🔧 HARDCODED: Force gemini-2.5-pro untuk analisis
    const genAI = new GoogleGenAI({ apiKey });

    // Build comprehensive analysis prompt
    let analysisPrompt = `You are a professional image generation prompt engineer. Your task is to analyze and enhance the user's prompt for optimal image generation results.

User's original prompt: "${userPrompt}"
`;

    if (templateContext) {
      analysisPrompt += `\nTemplate context: ${templateContext}`;
    }

    if (businessContext) {
      analysisPrompt += `\nBusiness context: ${businessContext}`;
    }

    analysisPrompt += `\n
Please provide:
1. Enhanced prompt that is optimized for AI image generation
2. Brief analysis of what improvements were made

Return your response in this JSON format:
{
  "enhancedPrompt": "your enhanced prompt here",
  "analysis": "explanation of improvements made"
}

Focus on:
- Adding technical photography terms
- Improving composition descriptions
- Enhancing lighting and style details
- Making the prompt more specific and actionable
- Maintaining the original intent while optimizing for image AI`;

    try {
      const result = await genAI.models.generateContent({
        model: analysisModel,
        contents: analysisPrompt
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = result.text || '';
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedResponse = {
          enhancedPrompt: userPrompt, // Use original as fallback
          analysis: 'Failed to parse enhancement response'
        };
      }

      const inputTokens = this.estimateTokens(analysisPrompt);
      const outputTokens = this.estimateTokens(responseText);

      // Log successful API call with specific endpoint
      await this.apiLogger.logApiCall({
        endpoint: 'image-generator/analyze-prompt',
        method: 'POST',
        modelUsed: analysisModel,
        status: 'SUCCESS' as any,
        responseTime,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        userId: userId || 'system',
        requestSize: Buffer.byteLength(analysisPrompt),
        responseSize: Buffer.byteLength(responseText),
      });

      return {
        enhancedPrompt: parsedResponse.enhancedPrompt || userPrompt,
        analysis: parsedResponse.analysis || 'Prompt enhanced successfully',
        inputTokens,
        outputTokens,
        model: analysisModel
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'image-generator/analyze-prompt',
        method: 'POST',
        modelUsed: analysisModel,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId: userId || 'system',
        requestSize: Buffer.byteLength(analysisPrompt),
      });

      throw error;
    }
  }

  /**
   * Generate images using Imagen 4.0 via Google AI API
   * Uses the proper GoogleGenAI SDK with generateImages method
   */
  async generateImageWithImagen(
    prompt: string,
    userId: string,
    options?: {
      model?: string;
      count?: number; // 1-12 images (batched in groups of 4)
      aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
      personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all';
    }
  ): Promise<{
    images: Array<{
      imageData: string; // base64 data
      seed?: string;
      generationTime: number;
    }>;
    generationTokens: number;
    model: string;
  }> {
    const apiKey = this.getCurrentApiKey();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const model = options?.model || 'imagen-4.0-generate-001';
    const totalImages = Math.min(Math.max(options?.count || 3, 1), 12); // Support up to 12 images
    const aspectRatio = options?.aspectRatio || '3:4'; // Use 3:4 as default for better framing
    
    // Clean up prompt - remove any /imagine prefixes or discord-style formatting
    const cleanPrompt = prompt
      .replace(/^\/imagine\s*/i, '')
      .replace(/^imagine\s*/i, '')
      .replace(/--[a-z]+\s+[\w:]+/gi, '') // Remove discord-style parameters
      .trim();
    
    // Map string values to proper enum values if needed
    let personGeneration: any = 'ALLOW_ADULT'; // Default value
    if (options?.personGeneration === 'dont_allow') {
      personGeneration = 'DONT_ALLOW';
    } else if (options?.personGeneration === 'allow_adult') {
      personGeneration = 'ALLOW_ADULT';
    } else if (options?.personGeneration === 'allow_all') {
      personGeneration = 'ALLOW_ALL';
    }
    
    const startTime = Date.now();
    
    try {
      console.log(`🎨 Generating ${totalImages} images with Imagen 4.0 (${aspectRatio})...`);
      console.log(`📝 Clean prompt: "${cleanPrompt}"`);
      
      // Calculate batches needed (max 4 images per API call)
      const batchSize = 4;
      const batches = Math.ceil(totalImages / batchSize);
      const allImages: Array<{
        imageData: string;
        seed?: string;
        generationTime: number;
      }> = [];
      
      console.log(`📊 Need ${batches} batches to generate ${totalImages} images (max ${batchSize} per batch)`);
      
      // Process each batch (accept what Imagen API gives us)
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const isLastBatch = batchIndex === batches - 1;
        const imagesInThisBatch = isLastBatch
          ? totalImages - (batchIndex * batchSize)
          : batchSize;
        
        console.log(`🔄 Processing batch ${batchIndex + 1}/${batches} (${imagesInThisBatch} images)...`);
        
        const batchStartTime = Date.now();
        
        try {
          const response = await ai.models.generateImages({
            model,
            prompt: cleanPrompt,
            config: {
              numberOfImages: imagesInThisBatch,
              aspectRatio,
              personGeneration,
            },
          });
          
          const batchTime = Date.now() - batchStartTime;
          
          // Debug: Log the batch response structure
          console.log(`🔍 Batch ${batchIndex + 1} response:`, {
            hasGeneratedImages: !!response.generatedImages,
            generatedImagesLength: response.generatedImages?.length || 0,
            expectedImages: imagesInThisBatch,
            actualVsExpected: `${response.generatedImages?.length || 0}/${imagesInThisBatch}`,
          });

          // 🔧 SMART: Accept whatever Imagen API gives us (API sometimes unstable)
          if (!response.generatedImages || response.generatedImages.length === 0) {
            console.warn(`⚠️ Batch ${batchIndex + 1} returned no images, skipping batch...`);
            continue;
          }

          const actualGenerated = response.generatedImages.length;
          if (actualGenerated < imagesInThisBatch) {
            console.warn(`⚠️ Batch ${batchIndex + 1} partial result: ${actualGenerated}/${imagesInThisBatch} images (Imagen API limitation)`);
          }

          // Process images from this batch
          let batchImageIndex = 0;
          for (const generatedImage of response.generatedImages) {
            const globalImageIndex = (batchIndex * batchSize) + batchImageIndex;
            
            console.log(`🔍 Processing batch ${batchIndex + 1} image ${batchImageIndex + 1} (global #${globalImageIndex + 1}):`, {
              hasImage: !!generatedImage.image,
              hasImageBytes: !!generatedImage.image?.imageBytes,
              imageBytesType: typeof generatedImage.image?.imageBytes,
              imageBytesLength: generatedImage.image?.imageBytes?.length || 0,
              imageBytesPreview: generatedImage.image?.imageBytes?.substring(0, 50) || 'none',
            });

            // Safely check for image data
            if (!generatedImage.image?.imageBytes) {
              console.warn(`⚠️ No image data for batch ${batchIndex + 1} image ${batchImageIndex + 1}, skipping...`);
              batchImageIndex++;
              continue;
            }
            
            const imageBytes = generatedImage.image.imageBytes; // base64 PNG data
            
            // Validate imageBytes format
            if (typeof imageBytes !== 'string' || imageBytes.length < 100) {
              console.warn(`⚠️ Invalid imageBytes for batch ${batchIndex + 1} image ${batchImageIndex + 1}:`, {
                type: typeof imageBytes,
                length: imageBytes?.length || 0,
                preview: typeof imageBytes === 'string' ? imageBytes.substring(0, 100) : 'not string'
              });
              batchImageIndex++;
              continue;
            }

            // Check if imageBytes contains HTML (error response)
            if (imageBytes.startsWith('<') || imageBytes.includes('<html')) {
              console.error(`🚨 Batch ${batchIndex + 1} image ${batchImageIndex + 1} contains HTML instead of base64:`, imageBytes.substring(0, 200));
              batchImageIndex++;
              continue;
            }

            const generationTime = batchTime / imagesInThisBatch; // Use average time per image in batch
            
            const imageData = `data:image/png;base64,${imageBytes}`;
            
            allImages.push({
              imageData,
              seed: `imagen-${Date.now()}-${globalImageIndex}`,
              generationTime
            });
            
            // Log each image generation as separate API call for billing
            await this.apiLogger.logApiCall({
              endpoint: `image-generator/generate-image-${globalImageIndex + 1}`,
              method: 'POST',
              modelUsed: model,
              status: 'SUCCESS' as any,
              responseTime: generationTime,
              inputTokens: 0, // Imagen doesn't use traditional input tokens
              outputTokens: 1, // Count as 1 request for billing
              totalTokens: 1,
              userId: userId,
              requestSize: Buffer.byteLength(cleanPrompt),
              responseSize: Buffer.byteLength(imageBytes, 'base64'),
            });

            console.log(`✅ Generated image ${globalImageIndex + 1}/${totalImages} successfully (batch ${batchIndex + 1})`);
            batchImageIndex++;
          }
          
          console.log(`✅ Completed batch ${batchIndex + 1}/${batches} - Generated ${batchImageIndex} images`);
        } catch (batchError) {
          console.error(`❌ Batch ${batchIndex + 1} failed:`, batchError.message);
          // Continue with next batch - don't stop entire generation
        }
      }

      if (allImages.length === 0) {
        throw new Error('No valid images were generated from any batch');
      }

      console.log(`🎨 Successfully generated ${allImages.length} images with Imagen 4.0`);

      return {
        images: allImages,
        generationTokens: allImages.length, // 1 token per successfully generated image
        model
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed image generation batch
      await this.apiLogger.logApiCall({
        endpoint: 'image-generator/generate-images-batch',
        method: 'POST',
        modelUsed: model,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'IMAGEN_ERROR',
        userId: userId,
        requestSize: Buffer.byteLength(prompt),
      });

      console.error('Imagen 4.0 generation error:', error);
      throw new BadRequestException(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Create final prompt for image generation
   * Uses Gemini to create the most effective prompt for Imagen
   */
  async createFinalPrompt(
    enhancedPrompt: string,
    additionalContext?: string,
    userId?: string
  ): Promise<{
    finalPrompt: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
  }> {
    const apiKey = this.getCurrentApiKey();
    const startTime = Date.now();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    const model = 'gemini-2.5-pro'; // 🔧 HARDCODED: Force gemini-2.5-pro untuk prompt creation
    const genAI = new GoogleGenAI({ apiKey });

    const promptCreationPrompt = `You are an expert at creating prompts for AI image generation. Take this enhanced prompt and create the final, most effective version for generating high-quality product images.

Enhanced prompt: "${enhancedPrompt}"
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Create a final prompt that:
- Is optimized for AI image generation
- Includes specific technical photography terms
- Maintains commercial quality focus
- Is clear and specific about desired output

Return only the final optimized prompt, no other text or explanations.`;

    try {
      const result = await genAI.models.generateContent({
        model,
        contents: promptCreationPrompt
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = result.text || '';
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const inputTokens = this.estimateTokens(promptCreationPrompt);
      const outputTokens = this.estimateTokens(responseText);

      // Log successful API call
      await this.apiLogger.logApiCall({
        endpoint: 'image-generator/create-prompt',
        method: 'POST',
        modelUsed: model,
        status: 'SUCCESS' as any,
        responseTime,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        userId: userId || 'system',
        requestSize: Buffer.byteLength(promptCreationPrompt),
        responseSize: Buffer.byteLength(responseText),
      });

      return {
        finalPrompt: responseText.trim(),
        inputTokens,
        outputTokens,
        model
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'image-generator/create-prompt',
        method: 'POST',
        modelUsed: model,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId: userId || 'system',
        requestSize: Buffer.byteLength(promptCreationPrompt),
      });

      throw error;
    }
  }

  // Caption Generator Extensions

  /**
   * STEP 1: Analyze Image + Generate 3 Caption Variations
   * Model: gemini-2.5-pro (Hardcoded)
   */
  async analyzeImageAndGenerateCaptions(
    imageFile: Express.Multer.File,
    userInput: {
      captionIdea?: string;
      platform: string; // FACEBOOK, INSTAGRAM, TIKTOK
      targetAudience?: string;
      tone: string; // PROFESSIONAL, CASUAL, etc.
      captionLength: string; // SHORT, MEDIUM, LONG
      useEmojis: boolean;
      useHashtags: boolean;
      language: string; // EN, ID
      businessContext?: string;
    },
    userId: string
  ): Promise<{
    captions: Array<{
      text: string;
      hashtags: string;
      characterCount: number;
      approach: string;
    }>;
    imageAnalysis: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
  }> {
    const apiKey = this.getCurrentApiKey();
    const startTime = Date.now();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    const model = 'gemini-2.5-pro'; // 🔧 HARDCODED
    const genAI = new GoogleGenAI({ apiKey });
    
    // Convert image to base64 for Gemini vision
    const imageBase64 = imageFile.buffer.toString('base64');
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.mimetype
      }
    };

    // Get character ranges based on length preference
    const getCharacterRange = (length: string) => {
      switch (length) {
        case 'SHORT': return '50-100 characters';
        case 'MEDIUM': return '150-250 characters';
        case 'LONG': return '350+ characters';
        default: return '150-250 characters';
      }
    };

    // 🔍 DEBUG: Log language processing
    console.log('🔍 DEBUG Gemini Service Language Check:', {
      userInputLanguage: userInput.language,
      languageType: typeof userInput.language,
      isIndonesian: userInput.language === 'ID',
      isEnglish: userInput.language === 'EN',
      willUseIndonesianPrompt: userInput.language === 'ID'
    });
    
    // Create completely different prompts based on language
    let analysisPrompt;
    
    if (userInput.language === 'ID') {
      console.log('✅ Using INDONESIAN prompt for caption generation');
      // INDONESIAN PROMPT - Entire prompt in Indonesian
      analysisPrompt = `Kamu adalah ahli konten media sosial dan strategi pemasaran yang berpengalaman. Analisis gambar ini dan buat 3 variasi caption yang menarik dalam bahasa Indonesia.

TUGAS ANALISIS GAMBAR:
1. Deskripsikan secara detail apa yang kamu lihat dalam gambar
2. Identifikasi elemen visual utama, warna, objek, orang, suasana
3. Tentukan sudut pemasaran terbaik untuk gambar ini

PERSYARATAN PEMBUATAN CAPTION:
Platform: ${userInput.platform}
Tone: ${userInput.tone}
Panjang Caption: ${userInput.captionLength} (${getCharacterRange(userInput.captionLength)})
Bahasa: BAHASA INDONESIA - Semua caption harus dalam bahasa Indonesia
Gunakan Emoji: ${userInput.useEmojis ? 'YA - Sertakan emoji yang relevan dalam caption' : 'TIDAK - Hanya teks, tanpa emoji'}
Gunakan Hashtag: ${userInput.useHashtags ? 'YA - Buat hashtag yang relevan' : 'TIDAK - Tidak perlu hashtag'}
${userInput.targetAudience ? `Target Audiens: ${userInput.targetAudience}` : ''}
${userInput.captionIdea ? `Ide Caption User: "${userInput.captionIdea}"` : ''}
${userInput.businessContext ? `Konteks Bisnis: ${userInput.businessContext}` : ''}

PANDUAN PLATFORM:
- FACEBOOK: Caption lebih panjang, storytelling, fokus engagement
- INSTAGRAM: Fokus visual, hashtag trendy, optimasi engagement
- TIKTOK: Pendek, impactful, trend-aware, call-to-action

PANDUAN EMOJI (jika diaktifkan):
- Gunakan emoji secara strategis untuk meningkatkan dampak emosional
- Sesuaikan emoji dengan konten dan budaya platform
- Jangan berlebihan - maksimal 2-4 emoji per caption
- Tempatkan emoji secara natural dalam teks

PANDUAN HASHTAG (jika diaktifkan):
- Buat 5-8 hashtag yang relevan per caption
- Campurkan hashtag populer dan niche
- Sertakan hashtag yang relevan dengan brand/bisnis jika ada konteks bisnis
- Strategi hashtag yang sesuai platform

Buat tepat 3 variasi caption dengan tone ${userInput.tone} dengan gaya yang berbeda:
1. VARIASI 1: Tone ${userInput.tone} dengan gaya bercerita
2. VARIASI 2: Tone ${userInput.tone} dengan gaya engagement langsung
3. VARIASI 3: Tone ${userInput.tone} dengan gaya percakapan

Semua 3 variasi harus mempertahankan tone ${userInput.tone} secara konsisten sambil menggunakan gaya presentasi yang berbeda.

Kembalikan respons dalam format JSON ini:
{
  "imageAnalysis": "deskripsi detail tentang apa yang terlihat dan potensi pemasaran dalam bahasa Indonesia",
  "captions": [
    {
      "variation": 1,
      "approach": "${userInput.tone} - Gaya Bercerita",
      "text": "teks caption dalam bahasa Indonesia dengan gaya bercerita${userInput.useEmojis ? ' dengan emoji jika diaktifkan' : ' tanpa emoji'}",
      "hashtags": "${userInput.useHashtags ? '#hashtag #relevan #indonesia' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'jumlah emoji yang digunakan' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'jumlah hashtag' : 0}
    },
    {
      "variation": 2,
      "approach": "${userInput.tone} - Gaya Engagement Langsung",
      "text": "teks caption dalam bahasa Indonesia dengan gaya engagement langsung${userInput.useEmojis ? ' dengan emoji jika diaktifkan' : ' tanpa emoji'}",
      "hashtags": "${userInput.useHashtags ? '#hashtag #relevan #indonesia' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'jumlah emoji yang digunakan' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'jumlah hashtag' : 0}
    },
    {
      "variation": 3,
      "approach": "${userInput.tone} - Gaya Percakapan",
      "text": "teks caption dalam bahasa Indonesia dengan gaya percakapan${userInput.useEmojis ? ' dengan emoji jika diaktifkan' : ' tanpa emoji'}",
      "hashtags": "${userInput.useHashtags ? '#hashtag #relevan #indonesia' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'jumlah emoji yang digunakan' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'jumlah hashtag' : 0}
    }
  ]
}

PENTING:
- Ikuti dengan ketat preferensi emoji dan hashtag. Jika useEmojis false, JANGAN sertakan emoji. Jika useHashtags false, kembalikan field hashtags kosong.
- Buat caption berkualitas tinggi dan menarik yang siap digunakan langsung.
- Semua teks harus dalam bahasa Indonesia yang natural dan engaging!`;
    } else {
      console.log('✅ Using ENGLISH prompt for caption generation');
      // ENGLISH PROMPT - Entire prompt in English
      analysisPrompt = `You are an expert social media content creator and marketing strategist. Analyze this image and create 3 engaging caption variations.

IMAGE ANALYSIS TASK:
1. Describe what you see in the image in detail
2. Identify key visual elements, colors, objects, people, mood
3. Determine the best marketing angle for this image

CAPTION GENERATION REQUIREMENTS:
Platform: ${userInput.platform}
Tone: ${userInput.tone}
Caption Length: ${userInput.captionLength} (${getCharacterRange(userInput.captionLength)})
Language: ENGLISH - ALL captions must be in English
Use Emojis: ${userInput.useEmojis ? 'YES - Include relevant emojis in captions' : 'NO - Text only, no emojis'}
Use Hashtags: ${userInput.useHashtags ? 'YES - Generate relevant hashtags' : 'NO - No hashtags needed'}
${userInput.targetAudience ? `Target Audience: ${userInput.targetAudience}` : ''}
${userInput.captionIdea ? `User's Caption Idea: "${userInput.captionIdea}"` : ''}
${userInput.businessContext ? `Business Context: ${userInput.businessContext}` : ''}

PLATFORM GUIDELINES:
- FACEBOOK: Longer captions, storytelling, engagement-focused
- INSTAGRAM: Visual-focused, trendy hashtags, optimal engagement
- TIKTOK: Short, punchy, trend-aware, call-to-action

EMOJI GUIDELINES (if enabled):
- Use emojis strategically to enhance emotional impact
- Match emojis to content and platform culture
- Don't overuse - 2-4 emojis per caption maximum
- Place emojis naturally within text

HASHTAG GUIDELINES (if enabled):
- Generate 5-8 relevant hashtags per caption
- Mix popular and niche hashtags
- Include brand/business relevant hashtags if business context provided
- Platform-specific hashtag strategy

Generate exactly 3 caption variations using the ${userInput.tone} tone with different styles:
1. VARIATION 1: ${userInput.tone} tone with storytelling style
2. VARIATION 2: ${userInput.tone} tone with direct engagement style
3. VARIATION 3: ${userInput.tone} tone with conversational style

All 3 variations must maintain the ${userInput.tone} tone consistently while using different presentation styles.

Return response in this JSON format:
{
  "imageAnalysis": "detailed description of what you see and marketing potential in English",
  "captions": [
    {
      "variation": 1,
      "approach": "${userInput.tone} - Storytelling Style",
      "text": "caption text in English with storytelling style${userInput.useEmojis ? ' with emojis if enabled' : ' without emojis'}",
      "hashtags": "${userInput.useHashtags ? '#relevant #hashtags #english' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'number of emojis used' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'number of hashtags' : 0}
    },
    {
      "variation": 2,
      "approach": "${userInput.tone} - Direct Engagement Style",
      "text": "caption text in English with direct engagement style${userInput.useEmojis ? ' with emojis if enabled' : ' without emojis'}",
      "hashtags": "${userInput.useHashtags ? '#relevant #hashtags #english' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'number of emojis used' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'number of hashtags' : 0}
    },
    {
      "variation": 3,
      "approach": "${userInput.tone} - Conversational Style",
      "text": "caption text in English with conversational style${userInput.useEmojis ? ' with emojis if enabled' : ' without emojis'}",
      "hashtags": "${userInput.useHashtags ? '#relevant #hashtags #english' : ''}",
      "characterCount": 0,
      "emojiCount": ${userInput.useEmojis ? 'number of emojis used' : 0},
      "hashtagCount": ${userInput.useHashtags ? 'number of hashtags' : 0}
    }
  ]
}

IMPORTANT:
- Strictly follow the emoji and hashtag preferences. If useEmojis is false, include NO emojis. If useHashtags is false, return empty hashtags field.
- Create high-quality, engaging captions that are ready to use immediately.
- All text must be in natural, engaging English!`;
    }

    try {
      const result = await genAI.models.generateContent({
        model,
        contents: [analysisPrompt, imagePart]
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = result.text || '';
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON response with better error handling
      let parsedResponse;
      try {
        // Try to clean the response text first
        let cleanResponseText = responseText.trim();
        
        // Remove potential markdown code blocks
        if (cleanResponseText.startsWith('```json')) {
          cleanResponseText = cleanResponseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponseText.startsWith('```')) {
          cleanResponseText = cleanResponseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to extract JSON from the response
        const jsonMatch = cleanResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponseText = jsonMatch[0];
        }
        
        parsedResponse = JSON.parse(cleanResponseText);
        console.log('🔍 Successfully parsed AI response for caption generation');
      } catch (parseError) {
        console.error('❌ Failed to parse AI response:', {
          originalLength: responseText.length,
          responsePreview: responseText.substring(0, 500),
          parseError: parseError.message
        });
        
        // Fallback: Create a basic response structure
        parsedResponse = {
          imageAnalysis: 'Image analyzed successfully (parsing fallback)',
          captions: [
            {
              variation: 1,
              approach: 'Emotional/Storytelling',
              text: 'Amazing visual content that captures attention and engages your audience perfectly!',
              hashtags: userInput.useHashtags ? '#amazing #content #social #engagement' : '',
              characterCount: 70
            },
            {
              variation: 2,
              approach: 'Direct/Sales',
              text: 'Ready to boost your engagement? This content delivers results you can see!',
              hashtags: userInput.useHashtags ? '#boost #results #marketing #success' : '',
              characterCount: 68
            },
            {
              variation: 3,
              approach: 'Educational/Informative',
              text: 'Here\'s what makes this content work: authentic visual storytelling that connects.',
              hashtags: userInput.useHashtags ? '#authentic #storytelling #connection #learn' : '',
              characterCount: 75
            }
          ]
        };
        console.log('🔄 Using fallback caption generation structure');
      }

      const inputTokens = this.estimateTokens(analysisPrompt);
      const outputTokens = this.estimateTokens(responseText);

      // Log successful API call
      await this.apiLogger.logApiCall({
        endpoint: 'caption-generator/analyze-image-generate-captions',
        method: 'POST',
        modelUsed: model,
        status: 'SUCCESS' as any,
        responseTime,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        userId,
        requestSize: Buffer.byteLength(analysisPrompt) + imageFile.size,
        responseSize: Buffer.byteLength(responseText),
      });

      return {
        captions: parsedResponse.captions?.map((cap: any) => ({
          text: cap.text || '',
          hashtags: cap.hashtags || '',
          characterCount: cap.characterCount || cap.text?.length || 0,
          approach: cap.approach || `Variation ${cap.variation}`
        })) || [],
        imageAnalysis: parsedResponse.imageAnalysis || 'Image analyzed successfully',
        inputTokens,
        outputTokens,
        model
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'caption-generator/analyze-image-generate-captions',
        method: 'POST',
        modelUsed: model,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId,
        requestSize: Buffer.byteLength(analysisPrompt) + imageFile.size,
      });

      throw error;
    }
  }

  /**
   * STEP 2: Positive Analysis & Enhancement Insights
   * Model: gemini-2.5-pro
   * 🔧 FOKUS: HANYA ANALISIS POSITIF - NO CRITICISM!
   */
  async analyzeGeneratedCaptions(
    captions: Array<{
      text: string;
      hashtags: string;
      variation: number;
      approach: string;
    }>,
    platform: string,
    imageAnalysis: string,
    language: string,
    userId: string
  ): Promise<{
    analyses: Array<{
      variation: number;
      engagementScore: number; // 7-10 range (always positive)
      readabilityScore: number; // 7-10 range
      ctaStrength: number; // 7-10 range
      brandVoiceScore: number; // 7-10 range
      trendingPotential: number; // 7-10 range
      emotionalImpact: number; // 7-10 range
      hookEffectiveness: number; // 7-10 range
      platformOptimization: number; // 7-10 range
      keywordRelevance: number; // 7-10 range
      viralityPotential: 'HIGH' | 'VERY HIGH'; // Always positive
      strengths: string[]; // What makes this caption great
      marketingImpact: string; // Positive impact prediction
      whyItWorks: string; // Explanation of success factors
    }>;
    inputTokens: number;
    outputTokens: number;
    model: string;
  }> {
    const apiKey = this.getCurrentApiKey();
    const startTime = Date.now();
    
    if (!apiKey) {
      throw new BadRequestException('No API key configured');
    }

    const model = 'gemini-2.5-pro'; // 🔧 HARDCODED
    const genAI = new GoogleGenAI({ apiKey });
    
    // 🔍 DEBUG: Log language processing for caption analysis
    console.log('🔍 DEBUG Gemini Service Analysis Language Check:', {
      language: language,
      languageType: typeof language,
      isIndonesian: language === 'ID',
      isEnglish: language === 'EN',
      willUseIndonesianPrompt: language === 'ID'
    });
    
    // Create completely different prompts based on language
    let analysisPrompt;
    
    if (language === 'ID') {
      console.log('✅ Using INDONESIAN prompt for caption analysis');
      // INDONESIAN ANALYSIS PROMPT - Entire prompt in Indonesian
      analysisPrompt = `Kamu adalah ahli pemasaran media sosial yang positif. Tugasmu adalah menyoroti KEKUATAN dan POTENSI dari caption-caption yang sudah dibuat ini.

PLATFORM: ${platform}
KONTEKS GAMBAR: ${imageAnalysis}

CAPTION YANG AKAN DIANALISIS:
${captions.map((cap, idx) => `
CAPTION ${idx + 1} (${cap.approach}):
Teks: "${cap.text}"
Hashtags: "${cap.hashtags}"
`).join('\n')}

PERSYARATAN ANALISIS POSITIF:
🎯 Fokus HANYA pada kekuatan dan potensi
🎯 TIDAK boleh ada feedback negatif atau kritik
🎯 TIDAK boleh ada saran perbaikan
🎯 Tonjolkan apa yang membuat setiap caption efektif
🎯 Prediksi hasil engagement yang positif
🎯 Semua skor harus dalam rentang 7-10 (selalu prediksi positif)

Untuk setiap caption, berikan skor dan analisis:
1. ENGAGEMENT SCORE (7-10): Mengapa akan perform dengan baik
2. READABILITY SCORE (7-10): Seberapa jelas dan mudah dibaca
3. CTA STRENGTH (7-10): Efektivitas call-to-action
4. BRAND VOICE SCORE (7-10): Konsistensi brand dan voice
5. TRENDING POTENTIAL (7-10): Kemungkinan untuk viral/trending
6. EMOTIONAL IMPACT (7-10): Kekuatan koneksi emosional
7. HOOK EFFECTIVENESS (7-10): Kekuatan kalimat pembuka
8. PLATFORM OPTIMIZATION (7-10): Seberapa cocok dengan platform
9. KEYWORD RELEVANCE (7-10): Seberapa cocok keyword dengan intent
10. VIRALITY POTENTIAL: "HIGH" atau "VERY HIGH" saja

Kembalikan respons dalam format JSON ini:
{
  "penilaianKeseluruhan": "ringkasan positif dari ketiga caption dan kekuatan kolektifnya dalam bahasa Indonesia",
  "analyses": [
    {
      "variation": 1,
      "engagementScore": 8,
      "readabilityScore": 9,
      "ctaStrength": 7,
      "brandVoiceScore": 8,
      "trendingPotential": 8,
      "emotionalImpact": 9,
      "hookEffectiveness": 8,
      "platformOptimization": 9,
      "keywordRelevance": 8,
      "viralityPotential": "HIGH",
      "kekuatan": ["kekuatan spesifik dalam bahasa Indonesia", "kekuatan kedua", "kekuatan ketiga"],
      "dampakPemasaran": "prediksi positif dampak bisnis dan ROI dalam bahasa Indonesia",
      "mengapaEfektif": "penjelasan detail mengapa caption ini akan sukses dalam bahasa Indonesia"
    }
  ]
}

PENTING:
- Bersemangat dan positif! Caption-caption ini siap untuk menghasilkan hasil yang luar biasa!
- Fokus pada potensi SUKSES dari setiap caption.
- Gunakan bahasa Indonesia yang natural dan menarik dalam semua analisis!`;
    } else {
      console.log('✅ Using ENGLISH prompt for caption analysis');
      // ENGLISH ANALYSIS PROMPT - Entire prompt in English
      analysisPrompt = `You are a positive social media marketing expert. Your job is to highlight the STRENGTHS and POTENTIAL of these generated captions.

PLATFORM: ${platform}
IMAGE CONTEXT: ${imageAnalysis}

GENERATED CAPTIONS TO ANALYZE:
${captions.map((cap, idx) => `
CAPTION ${idx + 1} (${cap.approach}):
Text: "${cap.text}"
Hashtags: "${cap.hashtags}"
`).join('\n')}

POSITIVE ANALYSIS REQUIREMENTS:
🎯 Focus ONLY on strengths and potential
🎯 NO negative feedback or criticisms
🎯 NO suggestions for improvement
🎯 Highlight what makes each caption effective
🎯 Predict positive engagement outcomes
🎯 All scores must be 7-10 range (always positive predictions)

For each caption, provide scores and analysis:
1. ENGAGEMENT SCORE (7-10): Why it will perform well
2. READABILITY SCORE (7-10): How clear and easy to read
3. CTA STRENGTH (7-10): Call-to-action effectiveness
4. BRAND VOICE SCORE (7-10): Brand consistency and voice
5. TRENDING POTENTIAL (7-10): Likelihood to trend/go viral
6. EMOTIONAL IMPACT (7-10): Emotional connection strength
7. HOOK EFFECTIVENESS (7-10): Opening sentence power
8. PLATFORM OPTIMIZATION (7-10): How well it fits the platform
9. KEYWORD RELEVANCE (7-10): How well keywords match intent
10. VIRALITY POTENTIAL: "HIGH" or "VERY HIGH" only

Return response in this JSON format:
{
  "overallAssessment": "positive summary of all 3 captions and their collective strength in English",
  "analyses": [
    {
      "variation": 1,
      "engagementScore": 8,
      "readabilityScore": 9,
      "ctaStrength": 7,
      "brandVoiceScore": 8,
      "trendingPotential": 8,
      "emotionalImpact": 9,
      "hookEffectiveness": 8,
      "platformOptimization": 9,
      "keywordRelevance": 8,
      "viralityPotential": "HIGH",
      "strengths": ["specific strength in English 1", "specific strength 2", "specific strength 3"],
      "marketingImpact": "positive prediction of business impact and ROI in English",
      "whyItWorks": "detailed explanation of why this caption will succeed in English"
    }
  ]
}

IMPORTANT:
- Be enthusiastic and positive! These captions are ready to drive amazing results!
- Focus on the SUCCESS potential of each caption.
- Use natural, engaging English in all analysis!`;
    }

    try {
      const result = await genAI.models.generateContent({
        model,
        contents: analysisPrompt
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = result.text || '';
      
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON response with better error handling
      let parsedResponse;
      try {
        // Try to clean the response text first
        let cleanResponseText = responseText.trim();
        
        // Remove potential markdown code blocks
        if (cleanResponseText.startsWith('```json')) {
          cleanResponseText = cleanResponseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResponseText.startsWith('```')) {
          cleanResponseText = cleanResponseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to extract JSON from the response
        const jsonMatch = cleanResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponseText = jsonMatch[0];
        }
        
        parsedResponse = JSON.parse(cleanResponseText);
        console.log('🔍 Successfully parsed AI response for caption analysis');
      } catch (parseError) {
        console.error('❌ Failed to parse AI response for analysis:', {
          originalLength: responseText.length,
          responsePreview: responseText.substring(0, 500),
          parseError: parseError.message
        });
        
        // Fallback: Create a basic analysis structure
        parsedResponse = {
          overallAssessment: 'All captions show strong potential for engagement and positive results',
          analyses: captions.map((caption, index) => ({
            variation: index + 1,
            engagementScore: 8,
            readabilityScore: 8,
            ctaStrength: 7,
            brandVoiceScore: 8,
            trendingPotential: 8,
            emotionalImpact: 8,
            hookEffectiveness: 8,
            platformOptimization: 8,
            keywordRelevance: 8,
            viralityPotential: 'HIGH',
            strengths: ['Engaging content', 'Strong messaging', 'Platform-appropriate'],
            marketingImpact: 'Strong positive impact expected for social media engagement',
            whyItWorks: 'Well-crafted caption with good engagement potential and clear messaging'
          }))
        };
        console.log('🔄 Using fallback caption analysis structure');
      }

      const inputTokens = this.estimateTokens(analysisPrompt);
      const outputTokens = this.estimateTokens(responseText);

      // Log successful API call
      await this.apiLogger.logApiCall({
        endpoint: 'caption-generator/analyze-generated-captions',
        method: 'POST',
        modelUsed: model,
        status: 'SUCCESS' as any,
        responseTime,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        userId,
        requestSize: Buffer.byteLength(analysisPrompt),
        responseSize: Buffer.byteLength(responseText),
      });

      return {
        analyses: parsedResponse.analyses?.map((analysis: any) => ({
          variation: analysis.variation || 1,
          engagementScore: Math.max(7, analysis.engagementScore || 8), // Ensure 7-10 range
          readabilityScore: Math.max(7, analysis.readabilityScore || 8),
          ctaStrength: Math.max(7, analysis.ctaStrength || 7),
          brandVoiceScore: Math.max(7, analysis.brandVoiceScore || 8),
          trendingPotential: Math.max(7, analysis.trendingPotential || 8),
          emotionalImpact: Math.max(7, analysis.emotionalImpact || 8),
          hookEffectiveness: Math.max(7, analysis.hookEffectiveness || 8),
          platformOptimization: Math.max(7, analysis.platformOptimization || 8),
          keywordRelevance: Math.max(7, analysis.keywordRelevance || 8),
          viralityPotential: analysis.viralityPotential === 'VERY HIGH' ? 'VERY HIGH' : 'HIGH',
          strengths: analysis.strengths || ['Engaging content', 'Strong messaging', 'Platform-appropriate'],
          marketingImpact: analysis.marketingImpact || 'Strong positive impact expected',
          whyItWorks: analysis.whyItWorks || 'Well-crafted caption with good engagement potential'
        })) || [],
        inputTokens,
        outputTokens,
        model
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      await this.apiLogger.logApiCall({
        endpoint: 'caption-generator/analyze-generated-captions',
        method: 'POST',
        modelUsed: model,
        status: 'FAILED' as any,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        userId,
        requestSize: Buffer.byteLength(analysisPrompt),
      });

      throw error;
    }
  }
}
