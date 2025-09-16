import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiLoggerService } from '../api-logger/api-logger.service';
import { ApiCallStatus } from '@prisma/client';

interface CachedModels {
  data: any[];
  timestamp: number;
  ttl: number;
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelsCache: CachedModels | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private currentApiKey: string | null = null; // Track current API key for updates

  constructor(
    private configService: ConfigService,
    private apiLogger: ApiLoggerService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
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

  private getFallbackModels() {
    // Known good model data as fallback when API is unavailable
    return [
      {
        name: 'gemini-1.5-pro-latest',
        displayName: 'Gemini 1.5 Pro',
        available: true,
        description: 'Most capable model for complex reasoning tasks',
        supportedGenerationMethods: ['generateContent'],
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192
      },
      {
        name: 'gemini-1.5-flash-latest',
        displayName: 'Gemini 1.5 Flash',
        available: true,
        description: 'Fast and versatile model for diverse tasks',
        supportedGenerationMethods: ['generateContent'],
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192
      },
      {
        name: 'gemini-2.5-flash-image-preview',
        displayName: 'Gemini 2.5 Flash Image Preview',
        available: true,
        description: 'Latest model for image analysis and generation',
        supportedGenerationMethods: ['generateContent'],
        inputTokenLimit: 1048576,
        outputTokenLimit: 8192
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
    this.genAI = new GoogleGenerativeAI(newApiKey);
    
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

    const genAI = new GoogleGenerativeAI(apiKey);
    // Prefer image-capable model only when image input is provided.
    const chosenModel = modelId || (imagePart ? 'gemini-2.0-flash-preview-image-generation' : 'gemini-2.5-flash');
    const model = genAI.getGenerativeModel({ model: chosenModel });

    try {
      const parts = imagePart ? [prompt, imagePart] : [prompt];
      const result = await model.generateContent(parts);
      const response = await result.response;
      const responseTime = Date.now() - startTime;
      const responseText = response.text();

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
        userId,
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
        userId,
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
    const models = options?.models || [
      'gemini-1.5-pro-latest',
      'gemini-2.5-flash',
      imagePart ? 'gemini-2.0-flash-preview-image-generation' : 'gemini-2.0-flash'
    ];
    const judgeModel = options?.judgeModel || 'gemini-2.5-pro-latest';

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
}
