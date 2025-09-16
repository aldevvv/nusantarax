import * as fs from 'fs';
import * as path from 'path';
import WavEncoder from 'wav-encoder';

// Lunos AI Client Library - https://lunos.tech

// src/client/config/DefaultConfig.ts
var DEFAULT_CONFIG = {
  baseUrl: "https://api.lunos.tech",
  apiKey: "",
  timeout: 6e4,
  retries: 3,
  retryDelay: 1e3,
  fallback_model: void 0,
  appId: "Unknown",
  debug: false
};
function mergeConfig(userConfig) {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig
  };
}

// src/client/errors/LunosError.ts
var LunosError = class extends Error {
  status;
  code;
  details;
  constructor(message, status = 0, code, details) {
    super(message);
    this.name = "LunosError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
};
var APIError = class extends LunosError {
  constructor(message, status, code, details) {
    super(message, status, code, details);
    this.name = "APIError";
  }
};
var ValidationError = class extends LunosError {
  constructor(message, details) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
};
var AuthenticationError = class extends LunosError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
};
var RateLimitError = class extends LunosError {
  constructor(message = "Rate limit exceeded", retryAfter) {
    super(message, 429, "RATE_LIMIT_ERROR", { retryAfter });
    this.name = "RateLimitError";
  }
};
var NetworkError = class extends LunosError {
  constructor(message = "Network error occurred") {
    super(message, 0, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
};

// src/utils/validation.ts
var ValidationUtils = class {
  /**
   * Validates a chat completion request
   */
  static validateChatCompletionRequest(request) {
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new ValidationError(
        "Messages array is required and cannot be empty"
      );
    }
    for (const message of request.messages) {
      if (!message.role || !message.content) {
        throw new ValidationError(
          "Each message must have a role and content"
        );
      }
      if (!["system", "user", "assistant", "function", "tool"].includes(
        message.role
      )) {
        throw new ValidationError(`Invalid role: ${message.role}`);
      }
    }
    if (request.temperature !== void 0 && (request.temperature < 0 || request.temperature > 2)) {
      throw new ValidationError("Temperature must be between 0 and 2");
    }
    if (request.top_p !== void 0 && (request.top_p < 0 || request.top_p > 1)) {
      throw new ValidationError("Top_p must be between 0 and 1");
    }
    if (request.max_tokens !== void 0 && request.max_tokens < 1) {
      throw new ValidationError("Max_tokens must be at least 1");
    }
    if (request.presence_penalty !== void 0 && (request.presence_penalty < -2 || request.presence_penalty > 2)) {
      throw new ValidationError("Presence penalty must be between -2 and 2");
    }
    if (request.frequency_penalty !== void 0 && (request.frequency_penalty < -2 || request.frequency_penalty > 2)) {
      throw new ValidationError(
        "Frequency penalty must be between -2 and 2"
      );
    }
  }
  /**
   * Validates an image generation request
   */
  static validateImageGenerationRequest(request) {
    if (!request.prompt || typeof request.prompt !== "string" || request.prompt.trim().length === 0) {
      throw new ValidationError("Prompt is required and cannot be empty");
    }
    if (request.n !== void 0 && (request.n < 1 || request.n > 10)) {
      throw new ValidationError("Number of images must be between 1 and 10");
    }
    if (request.size && ![
      "256x256",
      "512x512",
      "1024x1024",
      "1792x1024",
      "1024x1792"
    ].includes(request.size)) {
      throw new ValidationError(
        "Invalid size. Must be one of: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792"
      );
    }
    if (request.width !== void 0 && (request.width < 256 || request.width > 1792)) {
      throw new ValidationError("Width must be between 256 and 1792");
    }
    if (request.height !== void 0 && (request.height < 256 || request.height > 1792)) {
      throw new ValidationError("Height must be between 256 and 1792");
    }
    if (request.quality && !["standard", "hd"].includes(request.quality)) {
      throw new ValidationError('Quality must be either "standard" or "hd"');
    }
    if (request.response_format && !["url", "b64_json"].includes(request.response_format)) {
      throw new ValidationError(
        'Response format must be either "url" or "b64_json"'
      );
    }
    if (request.style && !["vivid", "natural"].includes(request.style)) {
      throw new ValidationError('Style must be either "vivid" or "natural"');
    }
  }
  /**
   * Validates an audio generation request
   */
  static validateAudioGenerationRequest(request) {
    if (!request.input || typeof request.input !== "string" || request.input.trim().length === 0) {
      throw new ValidationError(
        "Input text is required and cannot be empty"
      );
    }
    if (request.input.length > 4096) {
      throw new ValidationError("Input text cannot exceed 4096 characters");
    }
    if (request.voice) {
      const openAIVoices = [
        "alloy",
        "echo",
        "fable",
        "onyx",
        "nova",
        "shimmer"
      ];
      const googleVoices = [
        "Zephyr",
        "Puck",
        "Charon",
        "Kore",
        "Fenrir",
        "Leda",
        "Orus",
        "Aoede",
        "Callirrhoe",
        "Autonoe",
        "Enceladus",
        "Iapetus",
        "Umbriel",
        "Algieba",
        "Despina",
        "Erinome",
        "Algenib",
        "Rasalgethi",
        "Laomedeia",
        "Achernar",
        "Alnilam",
        "Schedar",
        "Gacrux",
        "Pulcherrima",
        "Achird",
        "Zubenelgenubi",
        "Vindemiatrix",
        "Sadachbia",
        "Sadaltager",
        "Sulafat"
      ];
      const model = request.model || "";
      if (model.startsWith("google")) {
        if (!googleVoices.includes(request.voice)) {
          throw new ValidationError(
            `Invalid voice for Google TTS. Must be one of: ${googleVoices.join(
              ", "
            )}`
          );
        }
      } else {
        if (!openAIVoices.includes(request.voice)) {
          throw new ValidationError(
            `Invalid voice for OpenAI TTS. Must be one of: ${openAIVoices.join(
              ", "
            )}`
          );
        }
      }
    }
    if (request.response_format && !["mp3", "opus", "aac", "flac", "pcm", "wav", "linear16"].includes(
      request.response_format
    )) {
      throw new ValidationError(
        "Response format must be one of: mp3, opus, aac, flac, pcm, wav, linear16"
      );
    }
    if (request.speed !== void 0 && (request.speed < 0.25 || request.speed > 4)) {
      throw new ValidationError("Speed must be between 0.25 and 4.0");
    }
  }
  /**
   * Validates an embedding request
   */
  static validateEmbeddingRequest(request) {
    if (!request.input) {
      throw new ValidationError("Input is required");
    }
    if (typeof request.input === "string") {
      if (request.input.trim().length === 0) {
        throw new ValidationError("Input text cannot be empty");
      }
    } else if (Array.isArray(request.input)) {
      if (request.input.length === 0) {
        throw new ValidationError("Input array cannot be empty");
      }
      for (const text of request.input) {
        if (typeof text !== "string" || text.trim().length === 0) {
          throw new ValidationError(
            "All input texts must be non-empty strings"
          );
        }
      }
    } else {
      throw new ValidationError(
        "Input must be a string or array of strings"
      );
    }
    if (request.encoding_format && !["float", "base64"].includes(request.encoding_format)) {
      throw new ValidationError(
        'Encoding format must be either "float" or "base64"'
      );
    }
    if (request.dimensions !== void 0 && request.dimensions < 1) {
      throw new ValidationError("Dimensions must be at least 1");
    }
  }
  /**
   * Validates API key format
   */
  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new ValidationError("API key is required");
    }
    if (apiKey.length < 10) {
      throw new ValidationError("API key appears to be invalid (too short)");
    }
  }
  /**
   * Validates base URL format
   */
  static validateBaseUrl(baseUrl) {
    if (!baseUrl || typeof baseUrl !== "string") {
      throw new ValidationError("Base URL is required");
    }
    try {
      new URL(baseUrl);
    } catch {
      throw new ValidationError("Invalid base URL format");
    }
  }
  /**
   * Validates timeout value
   */
  static validateTimeout(timeout) {
    if (typeof timeout !== "number" || timeout < 1e3 || timeout > 3e5) {
      throw new ValidationError(
        "Timeout must be a number between 1000 and 300000 milliseconds"
      );
    }
  }
  /**
   * Validates retry configuration
   */
  static validateRetryConfig(retries, retryDelay) {
    if (typeof retries !== "number" || retries < 0 || retries > 10) {
      throw new ValidationError("Retries must be a number between 0 and 10");
    }
    if (typeof retryDelay !== "number" || retryDelay < 100 || retryDelay > 1e4) {
      throw new ValidationError(
        "Retry delay must be a number between 100 and 10000 milliseconds"
      );
    }
  }
  /**
   * Validates a video generation request
   */
  static validateVideoGenerationRequest(request) {
    var _a;
    if (!request.prompt || typeof request.prompt !== "string" || request.prompt.trim().length === 0) {
      throw new ValidationError("Prompt is required and cannot be empty");
    }
    if (!request.model || typeof request.model !== "string" || request.model.trim().length === 0) {
      throw new ValidationError("Model is required and cannot be empty");
    }
    if (((_a = request.parameters) == null ? void 0 : _a.aspectRatio) && request.parameters.aspectRatio !== "16:9") {
      throw new ValidationError("Aspect ratio must be '16:9' or undefined");
    }
    if (request.response_format && request.response_format !== "mp4") {
      throw new ValidationError(
        "Response format must be 'mp4' or undefined"
      );
    }
  }
  /**
   * Validates fallback model configuration
   */
  static validateFallbackModel(fallbackModel) {
    if (fallbackModel !== void 0) {
      if (typeof fallbackModel !== "string" || fallbackModel.trim().length === 0) {
        throw new ValidationError(
          "Fallback model must be a non-empty string"
        );
      }
    }
  }
};

// src/services/base/BaseService.ts
var BaseService = class {
  config;
  fetchImpl;
  constructor(config) {
    this.config = config;
    this.fetchImpl = config.fetch || fetch;
  }
  /**
   * Makes a request to the API with retry logic and error handling
   */
  async makeRequest(endpoint, options = {}, requestOptions = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = requestOptions.timeout || this.config.timeout;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      ...this.config.headers,
      ...requestOptions.headers
    };
    const appId = requestOptions.appId || this.config.appId;
    if (appId) {
      headers["X-App-ID"] = appId;
    }
    const requestOptions_ = {
      ...options,
      headers,
      signal: requestOptions.signal || AbortSignal.timeout(timeout)
    };
    const retryConfig = {
      maxRetries: this.config.retries,
      baseDelay: this.config.retryDelay,
      maxDelay: 1e4,
      exponentialBackoff: true,
      retryStatusCodes: [408, 429, 500, 502, 503, 504]
    };
    return this.makeRequestWithRetry(
      url,
      requestOptions_,
      retryConfig,
      requestOptions.fallback_model || this.config.fallback_model
    );
  }
  /**
   * Makes a streaming request to the API
   */
  async makeStreamRequest(endpoint, options = {}, requestOptions = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = requestOptions.timeout || this.config.timeout;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      ...this.config.headers,
      ...requestOptions.headers
    };
    const appId = requestOptions.appId || this.config.appId;
    if (appId) {
      headers["X-App-ID"] = appId;
    }
    const requestOptions_ = {
      ...options,
      headers,
      signal: requestOptions.signal || AbortSignal.timeout(timeout)
    };
    try {
      const response = await this.fetchImpl(url, requestOptions_);
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }
      if (!response.body) {
        throw new LunosError("No response body for streaming request", 0);
      }
      return response.body;
    } catch (error) {
      const fallbackModel = requestOptions.fallback_model || this.config.fallback_model;
      if (fallbackModel && this.shouldTryFallback(error)) {
        return this.tryStreamWithFallbackModel(
          url,
          requestOptions_,
          fallbackModel
        );
      }
      if (error instanceof LunosError) {
        throw error;
      }
      throw new NetworkError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  /**
   * Makes a request to the API and returns the raw response body as Buffer (for audio, etc)
   */
  async makeRawRequest(endpoint, options = {}, requestOptions = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = requestOptions.timeout || this.config.timeout;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      ...this.config.headers,
      ...requestOptions.headers
    };
    const appId = requestOptions.appId || this.config.appId;
    if (appId) {
      headers["X-App-ID"] = appId;
    }
    const requestOptions_ = {
      ...options,
      headers,
      signal: requestOptions.signal || AbortSignal.timeout(timeout)
    };
    const response = await this.fetchImpl(url, requestOptions_);
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
  }
  /**
   * Makes a request with retry logic
   */
  async makeRequestWithRetry(url, options, retryConfig, fallbackModel) {
    let lastError;
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.fetchImpl(url, options);
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }
        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (error instanceof AuthenticationError || error instanceof ValidationError) {
          throw error;
        }
        if (attempt === retryConfig.maxRetries) {
          if (fallbackModel && this.shouldTryFallback(error)) {
            return this.tryWithFallbackModel(
              url,
              options,
              fallbackModel
            );
          }
          throw lastError;
        }
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        if (this.config.debug) {
          console.warn(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`
          );
        }
        await this.sleep(delay);
      }
    }
    throw lastError;
  }
  /**
   * Handles error responses from the API
   */
  async handleErrorResponse(response) {
    var _a;
    let errorMessage;
    let errorDetails;
    try {
      const errorData = await response.json();
      errorMessage = ((_a = errorData.error) == null ? void 0 : _a.message) || `HTTP ${response.status}`;
      errorDetails = errorData.error;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    switch (response.status) {
      case 401:
        throw new AuthenticationError(errorMessage);
      case 429:
        const retryAfter = response.headers.get("retry-after");
        throw new RateLimitError(
          errorMessage,
          retryAfter ? parseInt(retryAfter) : void 0
        );
      case 400:
        throw new LunosError(
          errorMessage,
          response.status,
          "BAD_REQUEST",
          errorDetails
        );
      case 403:
        throw new LunosError(
          errorMessage,
          response.status,
          "FORBIDDEN",
          errorDetails
        );
      case 404:
        throw new LunosError(
          errorMessage,
          response.status,
          "NOT_FOUND",
          errorDetails
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new LunosError(
          errorMessage,
          response.status,
          "SERVER_ERROR",
          errorDetails
        );
      default:
        throw new APIError(errorMessage, response.status);
    }
  }
  /**
   * Calculates retry delay with exponential backoff
   */
  calculateRetryDelay(attempt, retryConfig) {
    if (!retryConfig.exponentialBackoff) {
      return retryConfig.baseDelay;
    }
    const delay = retryConfig.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, retryConfig.maxDelay);
  }
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Determines if an error should trigger fallback model usage
   */
  shouldTryFallback(error) {
    const modelErrorKeywords = [
      "model",
      "model not found",
      "model unavailable",
      "model error",
      "invalid model",
      "model not available",
      "model temporarily unavailable"
    ];
    const errorMessage = error.message.toLowerCase();
    return modelErrorKeywords.some(
      (keyword) => errorMessage.includes(keyword)
    );
  }
  /**
   * Attempts the request with a fallback model
   */
  async tryWithFallbackModel(url, options, fallbackModel) {
    if (this.config.debug) {
      console.warn(`Trying with fallback model: ${fallbackModel}`);
    }
    try {
      const body = JSON.parse(options.body);
      const originalModel = body.model;
      body.model = fallbackModel;
      const fallbackOptions = {
        ...options,
        body: JSON.stringify(body)
      };
      const response = await this.fetchImpl(url, fallbackOptions);
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }
      const result = await response.json();
      if (this.config.debug) {
        console.warn(
          `Successfully used fallback model: ${fallbackModel} (original: ${originalModel})`
        );
      }
      return result;
    } catch (error) {
      if (this.config.debug) {
        console.error(
          `Fallback model ${fallbackModel} also failed:`,
          error
        );
      }
      throw error;
    }
  }
  /**
   * Attempts the streaming request with a fallback model
   */
  async tryStreamWithFallbackModel(url, options, fallbackModel) {
    if (this.config.debug) {
      console.warn(
        `Trying with fallback model for streaming: ${fallbackModel}`
      );
    }
    try {
      const body = JSON.parse(options.body);
      const originalModel = body.model;
      body.model = fallbackModel;
      const fallbackOptions = {
        ...options,
        body: JSON.stringify(body)
      };
      const response = await this.fetchImpl(url, fallbackOptions);
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }
      if (!response.body) {
        throw new LunosError("No response body for streaming request", 0);
      }
      if (this.config.debug) {
        console.warn(
          `Successfully used fallback model for streaming: ${fallbackModel} (original: ${originalModel})`
        );
      }
      return response.body;
    } catch (error) {
      if (this.config.debug) {
        console.error(
          `Fallback model ${fallbackModel} also failed for streaming:`,
          error
        );
      }
      throw error;
    }
  }
  /**
   * Validates the service configuration
   */
  validateConfig() {
    ValidationUtils.validateApiKey(this.config.apiKey);
    ValidationUtils.validateBaseUrl(this.config.baseUrl);
    ValidationUtils.validateTimeout(this.config.timeout);
    ValidationUtils.validateRetryConfig(
      this.config.retries,
      this.config.retryDelay
    );
  }
  /**
   * Logs debug information if debug mode is enabled
   */
  log(message, data) {
    if (this.config.debug) {
      console.log(`[Lunos Debug] ${message}`, data || "");
    }
  }
};

// src/utils/streaming.ts
var StreamProcessor = class {
  decoder;
  buffer;
  constructor() {
    this.decoder = new TextDecoder();
    this.buffer = "";
  }
  /**
   * Processes a streaming response from the API
   */
  async processStream(stream, options = {}) {
    var _a, _b, _c;
    const { onChunk, onComplete, onError, accumulate = false } = options;
    const reader = stream.getReader();
    let fullResponse = "";
    let completed = false;
    let error;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          completed = true;
          break;
        }
        this.buffer += this.decoder.decode(value, { stream: true });
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              completed = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (onChunk) {
                onChunk(parsed);
              }
              if (accumulate && ((_c = (_b = (_a = parsed.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content)) {
                fullResponse += parsed.choices[0].delta.content;
              }
            } catch (e) {
              console.warn("Failed to parse stream chunk:", e);
            }
          }
        }
      }
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      if (onError) {
        onError(error);
      }
    } finally {
      reader.releaseLock();
    }
    if (onComplete && completed) {
      onComplete();
    }
    return {
      fullResponse: accumulate ? fullResponse : void 0,
      completed,
      error
    };
  }
  /**
   * Creates a readable stream from a response stream
   */
  createReadableStream(stream, options = {}) {
    const { onChunk } = options;
    return new ReadableStream({
      start: async (controller) => {
        try {
          await this.processStream(stream, {
            ...options,
            onChunk: (chunk) => {
              var _a, _b, _c;
              if (onChunk) onChunk(chunk);
              if ((_c = (_b = (_a = chunk.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content) {
                controller.enqueue(chunk.choices[0].delta.content);
              }
            },
            onComplete: () => controller.close(),
            onError: (error) => controller.error(error)
          });
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
  /**
   * Processes a stream and returns the full response as a string
   */
  async processStreamToString(stream, onChunk) {
    const result = await this.processStream(stream, {
      onChunk: (chunk) => {
        var _a, _b, _c;
        if (onChunk && ((_c = (_b = (_a = chunk.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content)) {
          onChunk(chunk.choices[0].delta.content);
        }
      },
      accumulate: true
    });
    if (result.error) {
      throw result.error;
    }
    return result.fullResponse || "";
  }
  /**
   * Validates a stream response
   */
  static validateStreamResponse(response) {
    if (!response.ok) {
      throw new LunosError(
        `Stream request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    if (!response.body) {
      throw new LunosError("No response body for streaming request");
    }
  }
};

// src/services/ChatService.ts
var ChatService = class extends BaseService {
  /**
   * Creates a chat completion using the Lunos AI API.
   *
   * This method handles the core chat completion functionality, validating
   * the request parameters and making the API call to generate responses
   * based on conversation history. Supports fallback models for reliability.
   *
   * @param request - Complete chat completion request object containing
   *                  messages, model, parameters, and optional fallback model
   * @returns Promise resolving to ChatCompletionResponse with generated response
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.chat.createCompletion({
   *   model: "openai/gpt-4.1-mini",
   *   messages: [
   *     { role: "user", content: "Hello! Can you tell me a short joke?" }
   *   ],
   *   max_tokens: 100,
   *   fallback_model: "openai/gpt-4.1-mini",
   *   appId: "my-app"
   * });
   * ```
   */
  async createCompletion(request) {
    ValidationUtils.validateChatCompletionRequest(request);
    this.log("Creating chat completion", {
      model: request.model,
      messages: request.messages.length,
      fallback_model: request.fallback_model,
      appId: request.appId
    });
    return this.makeRequest(
      "/v1/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(request)
      },
      {
        fallback_model: request.fallback_model,
        appId: request.appId
      }
    );
  }
  /**
   * Creates a streaming chat completion that returns a raw stream.
   *
   * This method creates a streaming chat completion and returns the raw
   * ReadableStream for advanced stream processing. The stream contains
   * Server-Sent Events (SSE) chunks that need to be parsed.
   *
   * @param request - Complete chat completion request object
   * @returns Promise resolving to ReadableStream<Uint8Array> for raw stream processing
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const stream = await client.chat.createCompletionStream({
   *   model: "openai/gpt-4.1-mini",
   *   messages: [
   *     { role: "user", content: "Write a haiku about programming." }
   *   ]
   * });
   * ```
   */
  async createCompletionStream(request) {
    ValidationUtils.validateChatCompletionRequest(request);
    this.log("Creating streaming chat completion", {
      model: request.model,
      messages: request.messages.length,
      fallback_model: request.fallback_model
    });
    const streamRequest = { ...request, stream: true };
    return this.makeStreamRequest(
      "/v1/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(streamRequest)
      },
      {
        fallback_model: request.fallback_model
      }
    );
  }
  /**
   * Creates a streaming chat completion with optional callback processing.
   *
   * This method creates a streaming chat completion and optionally processes
   * the stream with a callback function. Similar to OpenAI's streaming API,
   * it provides real-time access to generated content chunks.
   *
   * @param request - Complete chat completion request object
   * @param onChunk - Optional callback function called for each content chunk
   * @returns Promise resolving to ReadableStream<Uint8Array> for further processing
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * let streamedResponse = "";
   * const stream = await client.chat.createCompletionWithStream(
   *   {
   *     model: "openai/gpt-4.1-mini",
   *     messages: [
   *       { role: "user", content: "Write a haiku about programming." }
   *     ]
   *   },
   *   (chunk) => {
   *     streamedResponse += chunk;
   *     process.stdout.write(chunk);
   *   }
   * );
   * ```
   */
  async createCompletionWithStream(request, onChunk) {
    const stream = await this.createCompletionStream(request);
    if (onChunk) {
      const processor = new StreamProcessor();
      processor.processStream(stream, {
        onChunk: (chunk) => {
          var _a, _b, _c;
          if ((_c = (_b = (_a = chunk.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content) {
            onChunk(chunk.choices[0].delta.content);
          }
        }
      });
    }
    return stream;
  }
  /**
   * Creates a streaming chat completion and returns the full response as a string.
   *
   * This method is provided for backward compatibility and convenience.
   * It processes the entire stream and returns the complete response as a string,
   * while optionally calling a callback for each chunk during processing.
   *
   * @param request - Complete chat completion request object
   * @param onChunk - Optional callback function called for each content chunk
   * @returns Promise resolving to the complete response as a string
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.chat.createCompletionWithStreamToString(
   *   {
   *     model: "openai/gpt-4.1-mini",
   *     messages: [
   *       { role: "user", content: "Explain quantum computing." }
   *     ]
   *   },
   *   (chunk) => console.log("Chunk:", chunk)
   * );
   * ```
   */
  async createCompletionWithStreamToString(request, onChunk) {
    const stream = await this.createCompletionStream(request);
    const processor = new StreamProcessor();
    return processor.processStreamToString(stream, onChunk);
  }
  /**
   * Gets a specific generation by ID from the API.
   *
   * This method retrieves information about a specific chat completion
   * generation using its unique identifier.
   *
   * @param id - Unique identifier of the generation to retrieve
   * @returns Promise resolving to generation information
   * @throws Error if ID is not provided or API call fails
   *
   * @example
   * ```typescript
   * const generation = await client.chat.getGeneration("gen_123456789");
   * ```
   */
  async getGeneration(id) {
    if (!id || typeof id !== "string") {
      throw new Error("Generation ID is required");
    }
    this.log("Getting generation", { id });
    return this.makeRequest(`/v1/chat/generation/${id}`);
  }
  /**
   * Convenience method for simple chat completions with structured parameters.
   *
   * This method provides a simplified interface for chat completions using
   * a structured object that separates messages from other options.
   *
   * @param options - Object containing messages and optional completion parameters
   * @returns Promise resolving to ChatCompletionResponse with generated response
   *
   * @example
   * ```typescript
   * const response = await client.chat.chat({
   *   messages: [
   *     { role: "user", content: "What is machine learning?" }
   *   ],
   *   model: "openai/gpt-4.1-mini",
   *   max_tokens: 200,
   *   temperature: 0.7,
   *   appId: "my-app"
   * });
   * ```
   */
  async chat(options) {
    return this.createCompletion({
      messages: options.messages,
      model: options.model,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
      stop: options.stop,
      n: options.n,
      stream: options.stream,
      fallback_model: options.fallback_model,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for streaming chat completions with structured parameters.
   *
   * This method provides a simplified interface for streaming chat completions
   * using a structured object that separates messages from other options.
   *
   * @param options - Object containing messages, callback, and optional parameters
   * @returns Promise resolving to ReadableStream<Uint8Array> for stream processing
   *
   * @example
   * ```typescript
   * const stream = await client.chat.chatStream({
   *   messages: [
   *     { role: "user", content: "Write a story about a robot." }
   *   ],
   *   model: "openai/gpt-4.1-mini",
   *   onChunk: (chunk) => console.log(chunk),
   *   max_tokens: 500
   * });
   * ```
   */
  async chatStream(options) {
    return this.createCompletionWithStream(
      {
        messages: options.messages,
        model: options.model,
        max_tokens: options.max_tokens,
        temperature: options.temperature,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty,
        stop: options.stop,
        n: options.n,
        fallback_model: options.fallback_model,
        user: options.user
      },
      options.onChunk
    );
  }
  /**
   * Creates a simple chat completion with a single user message.
   *
   * This convenience method simplifies chat completions when you only
   * need to send a single user message without complex conversation history.
   *
   * @param options - Object containing user message and optional parameters
   * @returns Promise resolving to ChatCompletionResponse with generated response
   *
   * @example
   * ```typescript
   * const response = await client.chat.chatWithUser({
   *   userMessage: "Explain the concept of recursion",
   *   model: "openai/gpt-4.1-mini",
   *   max_tokens: 300
   * });
   * ```
   */
  async chatWithUser(options) {
    return this.chat({
      messages: [{ role: "user", content: options.userMessage }],
      model: options.model,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
      stop: options.stop,
      n: options.n,
      fallback_model: options.fallback_model,
      user: options.user
    });
  }
  /**
   * Creates a chat completion with system and user messages.
   *
   * This convenience method is useful for setting up conversations with
   * a system prompt that defines the AI's behavior or role.
   *
   * @param options - Object containing system message, user message, and optional parameters
   * @returns Promise resolving to ChatCompletionResponse with generated response
   *
   * @example
   * ```typescript
   * const response = await client.chat.chatWithSystem({
   *   systemMessage: "You are a helpful coding assistant.",
   *   userMessage: "Write a function to calculate fibonacci numbers",
   *   model: "openai/gpt-4.1-mini",
   *   max_tokens: 400,
   *   appId: "my-app"
   * });
   * ```
   */
  async chatWithSystem(options) {
    return this.chat({
      messages: [
        { role: "system", content: options.systemMessage },
        { role: "user", content: options.userMessage }
      ],
      model: options.model,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
      stop: options.stop,
      n: options.n,
      fallback_model: options.fallback_model,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Creates a conversation with multiple messages.
   *
   * This method is an alias for the chat method, providing semantic clarity
   * when working with multi-turn conversations.
   *
   * @param options - Object containing messages and optional parameters
   * @returns Promise resolving to ChatCompletionResponse with generated response
   *
   * @example
   * ```typescript
   * const response = await client.chat.createConversation({
   *   messages: [
   *     { role: "system", content: "You are a helpful assistant." },
   *     { role: "user", content: "Hello!" },
   *     { role: "assistant", content: "Hi there! How can I help you today?" },
   *     { role: "user", content: "What's the weather like?" }
   *   ],
   *   model: "openai/gpt-4.1-mini"
   * });
   * ```
   */
  async createConversation(options) {
    return this.chat(options);
  }
  /**
   * Gets API usage information for the current account.
   *
   * This method retrieves usage statistics and billing information
   * for the authenticated API key.
   *
   * @returns Promise resolving to usage information object
   * @throws Error if API call fails or endpoint is not available
   *
   * @example
   * ```typescript
   * const usage = await client.chat.getUsage();
   * console.log("Total tokens used:", usage.total_tokens);
   * ```
   */
  async getUsage() {
    return this.makeRequest("/v1/usage");
  }
  /**
   * Gets account information for the authenticated API key.
   *
   * This method retrieves account details, limits, and settings
   * for the current API key.
   *
   * @returns Promise resolving to account information object
   * @throws Error if API call fails or endpoint is not available
   *
   * @example
   * ```typescript
   * const account = await client.chat.getAccount();
   * console.log("Account ID:", account.id);
   * ```
   */
  async getAccount() {
    return this.makeRequest("/v1/account");
  }
  /**
   * Validates chat messages for correctness and completeness.
   *
   * This static method performs validation on chat message arrays
   * to ensure they meet the API requirements before making requests.
   *
   * @param messages - Array of chat messages to validate
   * @throws Error if messages are invalid or incomplete
   *
   * @example
   * ```typescript
   * ChatService.validateMessages([
   *   { role: "user", content: "Hello" },
   *   { role: "assistant", content: "Hi there!" }
   * ]);
   * ```
   */
  static validateMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is required and cannot be empty");
    }
    for (const message of messages) {
      if (!message.role || !message.content) {
        throw new Error("Each message must have a role and content");
      }
      if (!["system", "user", "assistant", "function", "tool"].includes(
        message.role
      )) {
        throw new Error(`Invalid role: ${message.role}`);
      }
    }
  }
};

// src/services/ImageService.ts
var ImageService = class extends BaseService {
  /**
   * Generates an image based on a text prompt using the Lunos AI API.
   *
   * This method handles the core image generation functionality, validating
   * the request parameters and making the API call to generate images.
   *
   * @param request - Complete image generation request object containing
   *                  prompt, model, size, quality, and other parameters
   * @returns Promise resolving to ImageGenerationResponse with generated image data
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.image.generateImage({
   *   prompt: "A beautiful sunset over mountains",
   *   model: "openai/dall-e-3",
   *   size: "1024x1024",
   *   quality: "hd",
   *   appId: "my-app"
   * });
   * ```
   */
  async generateImage(request) {
    ValidationUtils.validateImageGenerationRequest(request);
    this.log("Generating image", {
      prompt: request.prompt,
      model: request.model,
      appId: request.appId
    });
    return this.makeRequest(
      "/v1/image/generations",
      {
        method: "POST",
        body: JSON.stringify(request)
      },
      {
        appId: request.appId
      }
    );
  }
  /**
   * Edits an existing image based on a text prompt and optional mask.
   *
   * This method allows for inpainting and outpainting operations by providing
   * an existing image and a text prompt describing the desired changes.
   *
   * @param request - Image edit request containing the base image, prompt,
   *                  optional mask, and generation parameters
   * @returns Promise resolving to ImageGenerationResponse with edited image data
   * @throws Error if image is not provided or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.image.editImage({
   *   image: "base64_encoded_image_data",
   *   prompt: "Add a red car to the scene",
   *   model: "openai/dall-e-2",
   *   size: "1024x1024"
   * });
   * ```
   */
  async editImage(request) {
    if (!request.image) {
      throw new Error("Image is required for editing");
    }
    this.log("Editing image", {
      prompt: request.prompt,
      model: request.model
    });
    return this.makeRequest("/v1/image/edits", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  /**
   * Creates variations of an existing image.
   *
   * This method generates multiple variations of a provided base image,
   * maintaining the overall composition while introducing subtle changes.
   *
   * @param request - Image variation request containing the base image
   *                  and generation parameters
   * @returns Promise resolving to ImageGenerationResponse with variation image data
   * @throws Error if image is not provided or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.image.createImageVariation({
   *   image: "base64_encoded_image_data",
   *   model: "openai/dall-e-2",
   *   n: 3,
   *   size: "1024x1024"
   * });
   * ```
   */
  async createImageVariation(request) {
    if (!request.image) {
      throw new Error("Image is required for variation");
    }
    this.log("Creating image variation", { model: request.model });
    return this.makeRequest("/v1/image/variations", {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  /**
   * Convenience method for simple image generation with structured parameters.
   *
   * This method provides a simplified interface for image generation using
   * a structured object that separates the prompt from other options.
   *
   * @param options - Object containing prompt and optional generation parameters
   * @returns Promise resolving to ImageGenerationResponse with generated image data
   *
   * @example
   * ```typescript
   * const response = await client.image.generate({
   *   prompt: "A futuristic city skyline",
   *   model: "openai/dall-e-3",
   *   size: "1024x1024",
   *   quality: "hd",
   *   appId: "my-app"
   * });
   * ```
   */
  async generate(options) {
    return this.generateImage({
      prompt: options.prompt,
      model: options.model,
      size: options.size,
      quality: options.quality,
      response_format: options.response_format,
      style: options.style,
      n: options.n,
      seed: options.seed,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for image generation with specific dimensions.
   *
   * This method allows for custom image dimensions while maintaining
   * the structured parameter approach.
   *
   * @param options - Object containing prompt, dimensions, and other parameters
   * @returns Promise resolving to ImageGenerationResponse with generated image data
   *
   * @example
   * ```typescript
   * const response = await client.image.generateWithSize({
   *   prompt: "A panoramic landscape",
   *   width: 1792,
   *   height: 1024,
   *   model: "openai/dall-e-3",
   *   quality: "hd",
   *   appId: "my-app"
   * });
   * ```
   */
  async generateWithSize(options) {
    return this.generateImage({
      prompt: options.prompt,
      width: options.width,
      height: options.height,
      model: options.model,
      quality: options.quality,
      response_format: options.response_format,
      style: options.style,
      n: options.n,
      seed: options.seed,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for high-quality image generation.
   *
   * This method automatically sets the quality to "hd" for high-definition
   * image generation while using the structured parameter approach.
   *
   * @param options - Object containing prompt and other parameters
   * @returns Promise resolving to ImageGenerationResponse with HD image data
   *
   * @example
   * ```typescript
   * const response = await client.image.generateHD({
   *   prompt: "A detailed portrait of a cat",
   *   model: "openai/dall-e-3",
   *   size: "1024x1024"
   * });
   * ```
   */
  async generateHD(options) {
    return this.generateImage({
      prompt: options.prompt,
      quality: "hd",
      model: options.model,
      size: options.size,
      response_format: options.response_format,
      style: options.style,
      n: options.n,
      seed: options.seed,
      user: options.user
    });
  }
  /**
   * Convenience method for image generation with base64 response format.
   *
   * This method automatically sets the response format to base64 JSON
   * for direct image data access.
   *
   * @param options - Object containing prompt and other parameters
   * @returns Promise resolving to ImageGenerationResponse with base64 image data
   *
   * @example
   * ```typescript
   * const response = await client.image.generateBase64({
   *   prompt: "A digital art piece",
   *   model: "openai/dall-e-3",
   *   size: "1024x1024",
   *   appId: "my-app"
   * });
   * ```
   */
  async generateBase64(options) {
    return this.generateImage({
      prompt: options.prompt,
      response_format: "b64_json",
      model: options.model,
      size: options.size,
      quality: options.quality,
      style: options.style,
      n: options.n,
      seed: options.seed,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for image generation with URL response format.
   *
   * This method automatically sets the response format to URL
   * for direct image URL access.
   *
   * @param options - Object containing prompt and other parameters
   * @returns Promise resolving to ImageGenerationResponse with image URLs
   *
   * @example
   * ```typescript
   * const response = await client.image.generateURL({
   *   prompt: "A modern office space",
   *   model: "openai/dall-e-3",
   *   size: "1024x1024"
   * });
   * ```
   */
  async generateURL(options) {
    return this.generateImage({
      prompt: options.prompt,
      response_format: "url",
      model: options.model,
      size: options.size,
      quality: options.quality,
      style: options.style,
      n: options.n,
      seed: options.seed,
      user: options.user
    });
  }
  /**
   * Generates multiple images from a single prompt.
   *
   * This method allows for batch image generation with a specified count,
   * using the structured parameter approach.
   *
   * @param options - Object containing prompt, count, and other parameters
   * @returns Promise resolving to ImageGenerationResponse with multiple images
   * @throws Error if count is not between 1 and 10
   *
   * @example
   * ```typescript
   * const response = await client.image.generateMultiple({
   *   prompt: "A fantasy castle",
   *   count: 4,
   *   model: "openai/dall-e-3",
   *   size: "1024x1024"
   * });
   * ```
   */
  async generateMultiple(options) {
    if (options.count < 1 || options.count > 10) {
      throw new Error("Count must be between 1 and 10");
    }
    return this.generateImage({
      prompt: options.prompt,
      n: options.count,
      model: options.model,
      size: options.size,
      quality: options.quality,
      response_format: options.response_format,
      style: options.style,
      seed: options.seed,
      user: options.user
    });
  }
  /**
   * Validates image generation parameters for correctness.
   *
   * This static method performs validation on image generation parameters
   * to ensure they meet the API requirements before making requests.
   *
   * @param prompt - Text prompt for image generation
   * @param width - Optional width of the image
   * @param height - Optional height of the image
   * @throws Error if parameters are invalid
   *
   * @example
   * ```typescript
   * ImageService.validateImageGenerationParams(
   *   "A beautiful landscape",
   *   1024,
   *   1024
   * );
   * ```
   */
  static validateImageGenerationParams(prompt, width, height) {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt is required and cannot be empty");
    }
    if (width !== void 0 && (width < 256 || width > 1792)) {
      throw new Error("Width must be between 256 and 1792");
    }
    if (height !== void 0 && (height < 256 || height > 1792)) {
      throw new Error("Height must be between 256 and 1792");
    }
  }
};
var FileUtils = class {
  /**
   * Saves a buffer to a file
   */
  static async saveBufferToFile(buffer, filepath) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, buffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  /**
   * Reads a file as a buffer
   */
  static async readFileAsBuffer(filepath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  /**
   * Gets the file extension from a filepath
   */
  static getFileExtension(filepath) {
    return path.extname(filepath).slice(1);
  }
  /**
   * Checks if a file exists
   */
  static async fileExists(filepath) {
    return new Promise((resolve) => {
      fs.access(filepath, fs.constants.F_OK, (err) => {
        resolve(!err);
      });
    });
  }
  /**
   * Gets file size in bytes
   */
  static async getFileSize(filepath) {
    return new Promise((resolve, reject) => {
      fs.stat(filepath, (err, stats) => {
        if (err) reject(err);
        else resolve(stats.size);
      });
    });
  }
  /**
   * Creates a directory if it doesn't exist
   */
  static async ensureDirectoryExists(dirpath) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirpath, { recursive: true }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  /**
   * Converts a file to base64 string
   */
  static async fileToBase64(filepath) {
    const buffer = await this.readFileAsBuffer(filepath);
    return buffer.toString("base64");
  }
  /**
   * Converts base64 string to buffer
   */
  static base64ToBuffer(base64) {
    return Buffer.from(base64, "base64");
  }
  /**
   * Gets MIME type from file extension
   */
  static getMimeType(filepath) {
    const ext = this.getFileExtension(filepath).toLowerCase();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      pdf: "application/pdf",
      txt: "text/plain",
      json: "application/json"
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
};
var AudioService = class extends BaseService {
  /**
   * Generates audio from text input using the Lunos AI API.
   *
   * This method handles the core audio generation functionality, validating
   * the request parameters and making the API call to generate audio from text.
   * The response includes the audio buffer, content type, and suggested filename.
   *
   * @param request - Complete audio generation request object containing
   *                  input text, voice, format, speed, and other parameters
   * @returns Promise resolving to AudioGenerationResponse with audio buffer and metadata
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.audio.generateAudio({
   *   input: "Hello, this is a test of text to speech.",
   *   voice: "alloy",
   *   model: "openai/tts",
   *   response_format: "mp3",
   *   speed: 1.0,
   *   appId: "my-app"
   * });
   * ```
   */
  async generateAudio(request) {
    ValidationUtils.validateAudioGenerationRequest(request);
    this.log("Generating audio", {
      input: request.input.substring(0, 50) + "...",
      voice: request.voice,
      appId: request.appId
    });
    const { buffer, contentType } = await this.makeRawRequest(
      "/v1/audio/generations",
      {
        method: "POST",
        body: JSON.stringify(request)
      },
      {
        appId: request.appId
      }
    );
    return {
      audioBuffer: buffer,
      contentType,
      filename: `audio_${Date.now()}.${this.getFileExtension(contentType)}`
    };
  }
  /**
   * Generates audio and saves it directly to a file.
   *
   * This method combines audio generation with file saving, providing
   * a convenient way to generate and store audio files in one operation.
   *
   * @param request - Audio generation request object
   * @param filepath - Path where the audio file should be saved
   * @returns Promise resolving to the filepath where the audio was saved
   * @throws Error if audio generation fails or file saving fails
   *
   * @example
   * ```typescript
   * const filepath = await client.audio.generateAudioToFile({
   *   input: "Welcome to our application!",
   *   voice: "nova",
   *   model: "openai/tts"
   * }, "./output/audio.mp3");
   * ```
   */
  async generateAudioToFile(request, filepath) {
    const result = await this.generateAudio(request);
    await FileUtils.saveBufferToFile(result.audioBuffer, filepath);
    return filepath;
  }
  /**
   * Convenience method for text-to-speech with structured parameters.
   *
   * This method provides a simplified interface for text-to-speech using
   * a structured object that separates the text input from other options.
   *
   * @param options - Object containing text input and optional generation parameters
   * @returns Promise resolving to AudioGenerationResponse with generated audio
   *
   * @example
   * ```typescript
   * const response = await client.audio.textToSpeech({
   *   text: "Hello from Lunos AI! This is a test of text to speech.",
   *   voice: "alloy",
   *   model: "openai/tts",
   *   response_format: "mp3",
   *   speed: 1.0,
   *   appId: "my-app"
   * });
   * ```
   */
  async textToSpeech(options) {
    return this.generateAudio({
      input: options.text,
      voice: options.voice,
      model: options.model,
      response_format: options.response_format,
      speed: options.speed,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for text-to-speech with specific format.
   *
   * This method automatically sets the response format while maintaining
   * the structured parameter approach.
   *
   * @param options - Object containing text input, format, and other parameters
   * @returns Promise resolving to AudioGenerationResponse with audio in specified format
   *
   * @example
   * ```typescript
   * const response = await client.audio.textToSpeechWithFormat({
   *   text: "This is a high-quality audio sample.",
   *   format: "flac",
   *   voice: "echo",
   *   model: "openai/tts",
   *   appId: "my-app"
   * });
   * ```
   */
  async textToSpeechWithFormat(options) {
    return this.generateAudio({
      input: options.text,
      voice: options.voice,
      model: options.model,
      response_format: options.format,
      speed: options.speed,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for text-to-speech with speed control.
   *
   * This method allows for speed adjustment while maintaining
   * the structured parameter approach.
   *
   * @param options - Object containing text input, speed, and other parameters
   * @returns Promise resolving to AudioGenerationResponse with speed-adjusted audio
   * @throws Error if speed is not between 0.25 and 4.0
   *
   * @example
   * ```typescript
   * const response = await client.audio.textToSpeechWithSpeed({
   *   text: "This is a slow speech sample.",
   *   speed: 0.5,
   *   voice: "fable",
   *   model: "openai/tts",
   *   appId: "my-app"
   * });
   * ```
   */
  async textToSpeechWithSpeed(options) {
    if (options.speed < 0.25 || options.speed > 4) {
      throw new Error("Speed must be between 0.25 and 4.0");
    }
    return this.generateAudio({
      input: options.text,
      voice: options.voice,
      model: options.model,
      speed: options.speed,
      response_format: options.response_format,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Gets the file extension for a content type.
   *
   * This private method maps MIME content types to their corresponding
   * file extensions for proper file naming.
   *
   * @param contentType - MIME content type string
   * @returns File extension string
   *
   * @example
   * ```typescript
   * const extension = this.getFileExtension("audio/mpeg"); // Returns "mp3"
   * ```
   */
  getFileExtension(contentType) {
    const mapping = {
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
      "audio/webm": "webm",
      "audio/aac": "aac",
      "audio/flac": "flac"
    };
    return mapping[contentType] || "mp3";
  }
  /**
   * Validates audio generation parameters for correctness.
   *
   * This static method performs validation on audio generation parameters
   * to ensure they meet the API requirements before making requests.
   *
   * @param text - Text input for speech synthesis
   * @param voice - Optional voice identifier
   * @param speed - Optional speed multiplier
   * @throws Error if parameters are invalid
   *
   * @example
   * ```typescript
   * AudioService.validateAudioGenerationParams(
   *   "Hello world",
   *   "alloy",
   *   1.0
   * );
   * ```
   */
  static validateAudioGenerationParams(text, voice, speed) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Text input is required and cannot be empty");
    }
    if (text.length > 4096) {
      throw new Error("Text input cannot exceed 4096 characters");
    }
    if (voice && !["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice)) {
      throw new Error(
        "Invalid voice. Must be one of: alloy, echo, fable, onyx, nova, shimmer"
      );
    }
    if (speed !== void 0 && (speed < 0.25 || speed > 4)) {
      throw new Error("Speed must be between 0.25 and 4.0");
    }
  }
  /**
   * Helper to save any audio buffer to a file
   */
  static async saveAudioToFile(audioBuffer, filepath) {
    await fs.promises.writeFile(filepath, audioBuffer);
  }
  /**
   * Helper to convert PCM buffer to WAV file using wav-encoder (mono, 24kHz, 16-bit signed)
   * @param pcmBuffer - PCM audio buffer
   * @param wavFilePath - Output WAV file path
   * @param sampleRate - Sample rate (default 24000)
   */
  static async convertPCMToWav(pcmBuffer, wavFilePath, sampleRate = 24e3) {
    const int16Array = new Int16Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.length / 2
    );
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }
    const audioData = {
      sampleRate,
      channelData: [float32Array]
      // mono
    };
    const wavBuffer = await WavEncoder.encode(audioData);
    await fs.promises.writeFile(wavFilePath, Buffer.from(wavBuffer));
  }
};

// src/services/EmbeddingService.ts
var EmbeddingService = class extends BaseService {
  /**
   * Creates embeddings for input text using the Lunos AI API.
   *
   * This method handles the core embedding functionality, validating
   * the request parameters and making the API call to generate vector
   * representations of text. Supports both single texts and arrays of texts.
   *
   * @param request - Complete embedding request object containing
   *                  input text(s), model, encoding format, and dimensions
   * @returns Promise resolving to EmbeddingResponse with embedding vectors
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.embedding.createEmbedding({
   *   input: "This is a sample text for embedding.",
   *   model: "openai/text-embedding-3-small",
   *   encoding_format: "float",
   *   dimensions: 1536,
   *   appId: "my-app"
   * });
   * ```
   */
  async createEmbedding(request) {
    ValidationUtils.validateEmbeddingRequest(request);
    this.log("Creating embedding", {
      inputType: typeof request.input,
      inputLength: Array.isArray(request.input) ? request.input.length : 1,
      model: request.model,
      appId: request.appId
    });
    return this.makeRequest(
      "/v1/embeddings",
      {
        method: "POST",
        body: JSON.stringify(request)
      },
      {
        appId: request.appId
      }
    );
  }
  /**
   * Convenience method for embedding text with structured parameters.
   *
   * This method provides a simplified interface for text embedding using
   * a structured object that separates the input from other options.
   *
   * @param options - Object containing input text(s) and optional embedding parameters
   * @returns Promise resolving to EmbeddingResponse with embedding vectors
   *
   * @example
   * ```typescript
   * const response = await client.embedding.embed({
   *   input: "This is a sample text for embedding.",
   *   model: "openai/text-embedding-3-small",
   *   encoding_format: "float",
   *   dimensions: 1536,
   *   appId: "my-app"
   * });
   * ```
   */
  async embed(options) {
    return this.createEmbedding({
      input: options.input,
      model: options.model,
      encoding_format: options.encoding_format,
      dimensions: options.dimensions,
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Embeds a single text and returns the embedding vector as an array.
   *
   * This convenience method simplifies the process when you only need
   * the raw embedding vector for a single text input.
   *
   * @param text - Single text string to embed
   * @param model - Optional model identifier for embedding generation
   * @param appId - Optional application identifier for analytics
   * @returns Promise resolving to number array representing the embedding vector
   * @throws Error if embedding generation fails or response is invalid
   *
   * @example
   * ```typescript
   * const embedding = await client.embedding.embedText(
   *   "This is a sample text for embedding.",
   *   "openai/text-embedding-3-small",
   *   "my-app"
   * );
   * console.log("Embedding dimensions:", embedding.length);
   * ```
   */
  async embedText(text, model, appId) {
    var _a;
    const response = await this.embed({ input: text, model, appId });
    return ((_a = response.data[0]) == null ? void 0 : _a.embedding) || [];
  }
  /**
   * Embeds multiple texts and returns an array of embedding vectors.
   *
   * This convenience method processes multiple texts and returns their
   * embedding vectors as a 2D array, useful for batch processing.
   *
   * @param texts - Array of text strings to embed
   * @param model - Optional model identifier for embedding generation
   * @param appId - Optional application identifier for analytics
   * @returns Promise resolving to 2D number array with embedding vectors
   * @throws Error if embedding generation fails or response is invalid
   *
   * @example
   * ```typescript
   * const embeddings = await client.embedding.embedMultiple([
   *   "First text for embedding",
   *   "Second text for embedding",
   *   "Third text for embedding"
   * ], "openai/text-embedding-3-small", "my-app");
   * console.log("Number of embeddings:", embeddings.length);
   * ```
   */
  async embedMultiple(texts, model, appId) {
    const response = await this.embed({ input: texts, model, appId });
    return response.data.map((item) => item.embedding);
  }
  /**
   * Embeds text with base64 encoding format.
   *
   * This method automatically sets the encoding format to base64,
   * which can be useful for certain applications that require
   * base64-encoded embedding vectors.
   *
   * @param options - Object containing input text(s) and other parameters
   * @returns Promise resolving to EmbeddingResponse with base64-encoded embeddings
   *
   * @example
   * ```typescript
   * const response = await client.embedding.embedBase64({
   *   input: "Text for base64 embedding",
   *   model: "openai/text-embedding-3-small",
   *   dimensions: 1536
   * });
   * ```
   */
  async embedBase64(options) {
    return this.createEmbedding({
      input: options.input,
      model: options.model,
      encoding_format: "base64",
      dimensions: options.dimensions,
      user: options.user
    });
  }
  /**
   * Embeds text with float encoding format.
   *
   * This method automatically sets the encoding format to float,
   * which is the standard format for most embedding applications.
   *
   * @param options - Object containing input text(s) and other parameters
   * @returns Promise resolving to EmbeddingResponse with float-encoded embeddings
   *
   * @example
   * ```typescript
   * const response = await client.embedding.embedFloat({
   *   input: "Text for float embedding",
   *   model: "openai/text-embedding-3-small",
   *   dimensions: 1536
   * });
   * ```
   */
  async embedFloat(options) {
    return this.createEmbedding({
      input: options.input,
      model: options.model,
      encoding_format: "float",
      dimensions: options.dimensions,
      user: options.user
    });
  }
  /**
   * Embeds text with custom dimensions specification.
   *
   * This method allows for explicit dimension specification while maintaining
   * the structured parameter approach.
   *
   * @param options - Object containing input text(s), dimensions, and other parameters
   * @returns Promise resolving to EmbeddingResponse with custom-dimension embeddings
   * @throws Error if dimensions is less than 1
   *
   * @example
   * ```typescript
   * const response = await client.embedding.embedWithDimensions({
   *   input: "Text for custom dimension embedding",
   *   dimensions: 1024,
   *   model: "openai/text-embedding-3-small"
   * });
   * ```
   */
  async embedWithDimensions(options) {
    if (options.dimensions < 1) {
      throw new Error("Dimensions must be at least 1");
    }
    return this.createEmbedding({
      input: options.input,
      model: options.model,
      dimensions: options.dimensions,
      encoding_format: options.encoding_format,
      user: options.user
    });
  }
  /**
   * Calculates cosine similarity between two embedding vectors.
   *
   * This static method computes the cosine similarity between two
   * embedding vectors, which is a common metric for measuring
   * semantic similarity between texts.
   *
   * @param a - First embedding vector as number array
   * @param b - Second embedding vector as number array
   * @returns Cosine similarity value between 0 and 1 (1 = identical, 0 = orthogonal)
   * @throws Error if vectors have different lengths
   *
   * @example
   * ```typescript
   * const similarity = EmbeddingService.cosineSimilarity(
   *   embedding1,
   *   embedding2
   * );
   * console.log("Similarity:", similarity); // 0.0 to 1.0
   * ```
   */
  static cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error("Embedding vectors must have the same length");
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) {
      return 0;
    }
    return dotProduct / (normA * normB);
  }
  /**
   * Calculates Euclidean distance between two embedding vectors.
   *
   * This static method computes the Euclidean distance between two
   * embedding vectors, which is another common metric for measuring
   * vector similarity (lower distance = more similar).
   *
   * @param a - First embedding vector as number array
   * @param b - Second embedding vector as number array
   * @returns Euclidean distance value (0 = identical, higher = more different)
   * @throws Error if vectors have different lengths
   *
   * @example
   * ```typescript
   * const distance = EmbeddingService.euclideanDistance(
   *   embedding1,
   *   embedding2
   * );
   * console.log("Distance:", distance); // 0.0 to infinity
   * ```
   */
  static euclideanDistance(a, b) {
    if (a.length !== b.length) {
      throw new Error("Embedding vectors must have the same length");
    }
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
  /**
   * Finds the most similar embedding from a list of embeddings.
   *
   * This static method compares a query embedding against a list of
   * candidate embeddings and returns the index and similarity score
   * of the most similar one.
   *
   * @param queryEmbedding - Query embedding vector to compare against
   * @param embeddings - Array of candidate embedding vectors
   * @param metric - Similarity metric to use ("cosine" or "euclidean")
   * @returns Object containing index of most similar embedding and similarity score
   * @throws Error if embeddings array is empty
   *
   * @example
   * ```typescript
   * const result = EmbeddingService.findMostSimilar(
   *   queryEmbedding,
   *   candidateEmbeddings,
   *   "cosine"
   * );
   * console.log("Most similar index:", result.index);
   * console.log("Similarity score:", result.similarity);
   * ```
   */
  static findMostSimilar(queryEmbedding, embeddings, metric = "cosine") {
    if (embeddings.length === 0) {
      throw new Error("Embeddings array cannot be empty");
    }
    let bestIndex = 0;
    let bestSimilarity = metric === "cosine" ? this.cosineSimilarity(queryEmbedding, embeddings[0]) : -this.euclideanDistance(queryEmbedding, embeddings[0]);
    for (let i = 1; i < embeddings.length; i++) {
      const similarity = metric === "cosine" ? this.cosineSimilarity(queryEmbedding, embeddings[i]) : -this.euclideanDistance(queryEmbedding, embeddings[i]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestIndex = i;
      }
    }
    return { index: bestIndex, similarity: bestSimilarity };
  }
  /**
   * Validates embedding parameters for correctness.
   *
   * This static method performs validation on embedding parameters
   * to ensure they meet the API requirements before making requests.
   *
   * @param input - Text input(s) to validate
   * @param dimensions - Optional dimensions to validate
   * @throws Error if parameters are invalid
   *
   * @example
   * ```typescript
   * EmbeddingService.validateEmbeddingParams(
   *   "Sample text for embedding",
   *   1536
   * );
   * ```
   */
  static validateEmbeddingParams(input, dimensions) {
    if (!input) {
      throw new Error("Input is required");
    }
    if (typeof input === "string") {
      if (input.trim().length === 0) {
        throw new Error("Input text cannot be empty");
      }
    } else if (Array.isArray(input)) {
      if (input.length === 0) {
        throw new Error("Input array cannot be empty");
      }
      for (const text of input) {
        if (typeof text !== "string" || text.trim().length === 0) {
          throw new Error("All input texts must be non-empty strings");
        }
      }
    } else {
      throw new Error("Input must be a string or array of strings");
    }
    if (dimensions !== void 0 && dimensions < 1) {
      throw new Error("Dimensions must be at least 1");
    }
  }
};

// src/services/ModelService.ts
var ModelService = class extends BaseService {
  /**
   * Gets all available models from the Lunos AI API.
   *
   * This method retrieves the complete list of available models,
   * including their capabilities, pricing, and specifications.
   *
   * @returns Promise resolving to array of Model objects
   * @throws Error if API call fails
   *
   * @example
   * ```typescript
   * const models = await client.models.getModels();
   * console.log(`Available models: ${models.length}`);
   * ```
   */
  async getModels() {
    this.log("Getting all models");
    return this.makeRequest("/public/models");
  }
  /**
   * Gets a specific model by its unique identifier.
   *
   * This method searches through all available models to find
   * one with the specified ID and returns its details.
   *
   * @param id - Unique identifier of the model to retrieve
   * @returns Promise resolving to Model object or null if not found
   * @throws Error if ID is not provided
   *
   * @example
   * ```typescript
   * const model = await client.models.getModelById("openai/gpt-4.1-mini");
   * if (model) {
   *   console.log("Model found:", model.id);
   * }
   * ```
   */
  async getModelById(id) {
    if (!id || typeof id !== "string") {
      throw new Error("Model ID is required");
    }
    this.log("Getting model by ID", { id });
    const models = await this.getModels();
    return models.find((model) => model.id === id) || null;
  }
  /**
   * Gets models that support a specific capability.
   *
   * This method filters all available models to return only those
   * that support the specified capability (e.g., "chat", "image-generation").
   *
   * @param capability - Capability to filter by (e.g., "chat", "embeddings")
   * @returns Promise resolving to array of Model objects with the specified capability
   * @throws Error if capability is not provided
   *
   * @example
   * ```typescript
   * const chatModels = await client.models.getModelsByCapability("chat");
   * console.log(`Chat models available: ${chatModels.length}`);
   * ```
   */
  async getModelsByCapability(capability) {
    if (!capability || typeof capability !== "string") {
      throw new Error("Capability is required");
    }
    this.log("Getting models by capability", { capability });
    const models = await this.getModels();
    return models.filter((model) => {
      var _a;
      return (_a = model.capabilities) == null ? void 0 : _a.includes(capability);
    });
  }
  /**
   * Gets all models that support chat completions.
   *
   * This convenience method returns models that can be used for
   * conversational AI tasks and text generation.
   *
   * @returns Promise resolving to array of chat-capable Model objects
   *
   * @example
   * ```typescript
   * const chatModels = await client.models.getChatModels();
   * console.log("Available chat models:", chatModels.map(m => m.id));
   * ```
   */
  async getChatModels() {
    return this.getModelsByCapability("text-generation");
  }
  /**
   * Gets all models that support image generation.
   *
   * This convenience method returns models that can be used for
   * creating images from text prompts.
   *
   * @returns Promise resolving to array of image-generation-capable Model objects
   *
   * @example
   * ```typescript
   * const imageModels = await client.models.getImageModels();
   * console.log("Available image models:", imageModels.map(m => m.id));
   * ```
   */
  async getImageModels() {
    return this.getModelsByCapability("image-generation");
  }
  /**
   * Gets all models that support text-to-speech generation.
   *
   * This convenience method returns models that can be used for
   * converting text to spoken audio.
   *
   * @returns Promise resolving to array of text-to-speech-capable Model objects
   *
   * @example
   * ```typescript
   * const audioModels = await client.models.getAudioModels();
   * console.log("Available audio models:", audioModels.map(m => m.id));
   * ```
   */
  async getAudioModels() {
    return this.getModelsByCapability("speech-generation");
  }
  /**
   * Gets all models that support text embeddings.
   *
   * This convenience method returns models that can be used for
   * creating vector representations of text.
   *
   * @returns Promise resolving to array of embedding-capable Model objects
   *
   * @example
   * ```typescript
   * const embeddingModels = await client.models.getEmbeddingModels();
   * console.log("Available embedding models:", embeddingModels.map(m => m.id));
   * ```
   */
  async getEmbeddingModels() {
    return this.getModelsByCapability("text-embedding");
  }
  /**
   * Gets all models that support audio transcription.
   *
   * This convenience method returns models that can be used for
   * converting speech to text.
   *
   * @returns Promise resolving to array of transcription-capable Model objects
   *
   * @example
   * ```typescript
   * const transcriptionModels = await client.models.getTranscriptionModels();
   * console.log("Available transcription models:", transcriptionModels.map(m => m.id));
   * ```
   */
  async getTranscriptionModels() {
    return this.getModelsByCapability("audio-transcription");
  }
  /**
   * Gets models by their owner/organization.
   *
   * This method filters models by the organization or company that
   * owns them (e.g., "openai", "anthropic").
   *
   * @param owner - Owner/organization name to filter by
   * @returns Promise resolving to array of Model objects from the specified owner
   * @throws Error if owner is not provided
   *
   * @example
   * ```typescript
   * const openaiModels = await client.models.getModelsByOwner("openai");
   * console.log(`OpenAI models: ${openaiModels.length}`);
   * ```
   */
  async getModelsByOwner(owner) {
    if (!owner || typeof owner !== "string") {
      throw new Error("Owner is required");
    }
    this.log("Getting models by owner", { owner });
    const models = await this.getModels();
    return models.filter((model) => model.provider === owner);
  }
  /**
   * Gets detailed capability information for a specific model.
   *
   * This method returns a list of all capabilities supported by the specified model.
   *
   * @param modelId - Unique identifier of the model to check
   * @returns Promise resolving to array of capability names
   * @throws Error if model is not found
   */
  async getModelCapabilities(modelId) {
    const model = await this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    return model.capabilities || [];
  }
  /**
   * Checks if a specific model supports a given capability.
   *
   * This method provides a simple boolean check for whether a model
   * supports a particular capability without returning detailed information.
   *
   * @param modelId - Unique identifier of the model to check
   * @param capability - Capability to check for (e.g., "chat", "embeddings")
   * @returns Promise resolving to boolean indicating capability support
   *
   * @example
   * ```typescript
   * const supportsChat = await client.models.supportsCapability(
   *   "openai/gpt-4.1-mini",
   *   "chat"
   * );
   * console.log("Supports chat:", supportsChat);
   * ```
   */
  async supportsCapability(modelId, capability) {
    var _a;
    const model = await this.getModelById(modelId);
    if (!model) {
      return false;
    }
    return ((_a = model.capabilities) == null ? void 0 : _a.includes(capability)) || false;
  }
  /**
   * Gets pricing information for a specific model.
   *
   * This method returns the input and output token pricing
   * for the specified model, useful for cost estimation.
   *
   * @param modelId - Unique identifier of the model to get pricing for
   * @returns Promise resolving to pricing object or null if not available
   *
   * @example
   * ```typescript
   * const pricing = await client.models.getModelPricing("openai/gpt-4.1-mini");
   * if (pricing) {
   *   console.log(`Input: $${pricing.input}/1K tokens`);
   *   console.log(`Output: $${pricing.output}/1K tokens`);
   * }
   * ```
   */
  async getModelPricing(modelId) {
    const model = await this.getModelById(modelId);
    return (model == null ? void 0 : model.pricePerMillionTokens) || null;
  }
  /**
   * Gets the context length (maximum tokens) for a specific model.
   *
   * This method returns the maximum number of tokens that can be
   * processed in a single request for the specified model.
   *
   * @param modelId - Unique identifier of the model to get context length for
   * @returns Promise resolving to context length number or null if not available
   *
   * @example
   * ```typescript
   * const contextLength = await client.models.getModelContextLength("openai/gpt-4.1-mini");
   * if (contextLength) {
   *   console.log(`Context length: ${contextLength} tokens`);
   * }
   * ```
   */
  async getModelContextLength(modelId) {
    const model = await this.getModelById(modelId);
    return (model == null ? void 0 : model.parameters.context) || null;
  }
  /**
   * Searches models by name, owner, or description.
   *
   * This method performs a case-insensitive search across model IDs,
   * owner names, and descriptions to find matching models.
   *
   * @param query - Search query string to match against model information
   * @returns Promise resolving to array of Model objects matching the query
   * @throws Error if query is not provided
   *
   * @example
   * ```typescript
   * const searchResults = await client.models.searchModels("gpt-4");
   * console.log(`Found ${searchResults.length} models matching "gpt-4"`);
   * ```
   */
  async searchModels(query) {
    if (!query || typeof query !== "string") {
      throw new Error("Search query is required");
    }
    this.log("Searching models", { query });
    const models = await this.getModels();
    const lowerQuery = query.toLowerCase();
    return models.filter(
      (model) => {
        var _a;
        return model.id.toLowerCase().includes(lowerQuery) || model.provider.toLowerCase().includes(lowerQuery) || ((_a = model.description) == null ? void 0 : _a.toLowerCase().includes(lowerQuery));
      }
    );
  }
  /**
   * Validates model parameters for correctness.
   *
   * This static method performs validation on model parameters
   * to ensure they meet the API requirements before making requests.
   *
   * @param modelId - Model identifier to validate
   * @throws Error if modelId is invalid
   *
   * @example
   * ```typescript
   * ModelService.validateModelParams("openai/gpt-4.1-mini");
   * ```
   */
  static validateModelParams(modelId) {
    if (!modelId || typeof modelId !== "string") {
      throw new Error("Model ID is required");
    }
    if (modelId.trim().length === 0) {
      throw new Error("Model ID cannot be empty");
    }
  }
};

// src/services/VideoService.ts
var VideoService = class extends BaseService {
  /**
   * Generates a video based on a text prompt using the Lunos AI API.
   *
   * This method handles the core video generation functionality, validating
   * the request parameters and making the API call to start video generation.
   * The response contains an operation ID that can be used to track progress.
   *
   * @param request - Complete video generation request object containing
   *                  prompt, model, parameters, and other options
   * @returns Promise resolving to VideoGenerationResponse with operation ID
   * @throws Error if request validation fails or API call fails
   *
   * @example
   * ```typescript
   * const response = await client.video.generateVideo({
   *   model: "google/veo-3.0-generate-preview",
   *   prompt: "A cinematic shot of a majestic lion in the savannah.",
   *   parameters: {
   *     aspectRatio: "16:9",
   *     negativePrompt: "cartoon, drawing, low quality"
   *   },
   *   response_format: "mp4",
   *   appId: "my-app"
   * });
   * ```
   */
  async generateVideo(request) {
    ValidationUtils.validateVideoGenerationRequest(request);
    this.log("Generating video", {
      prompt: request.prompt,
      model: request.model,
      appId: request.appId
    });
    return this.makeRequest(
      "/v1/video/generations",
      {
        method: "POST",
        body: JSON.stringify(request)
      },
      {
        appId: request.appId
      }
    );
  }
  /**
   * Checks the status of a video generation operation.
   *
   * This method polls the status endpoint to check if video generation
   * is complete and retrieves the video URL when ready.
   *
   * @param operationId - The operation ID returned from generateVideo
   * @param appId - Optional application identifier
   * @returns Promise resolving to VideoGenerationStatus with current status
   * @throws Error if operation ID is invalid or API call fails
   *
   * @example
   * ```typescript
   * const status = await client.video.getVideoStatus(
   *   "video-op:user123:1703123456789",
   *   "my-app"
   * );
   *
   * if (status.status === "completed") {
   *   console.log("Video URL:", status.video_url);
   * }
   * ```
   */
  async getVideoStatus(operationId, appId) {
    if (!operationId || typeof operationId !== "string") {
      throw new Error("Operation ID is required");
    }
    this.log("Checking video status", { operationId, appId });
    return this.makeRequest(
      `/v1/video/generations/${operationId}`,
      {
        method: "GET"
      },
      {
        appId
      }
    );
  }
  /**
   * Generates a video and waits for completion.
   *
   * This method starts video generation and polls the status endpoint
   * until the video is ready, then returns the final result.
   *
   * @param request - Video generation request
   * @param pollInterval - Interval in milliseconds between status checks (default: 10000)
   * @param maxWaitTime - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
   * @returns Promise resolving to VideoGenerationStatus with video URL
   * @throws Error if generation fails or timeout is reached
   *
   * @example
   * ```typescript
   * const result = await client.video.generateVideoAndWait({
   *   model: "google/veo-3.0-generate-preview",
   *   prompt: "A beautiful sunset over mountains",
   *   parameters: {
   *     aspectRatio: "16:9"
   *   }
   * });
   *
   * console.log("Video URL:", result.video_url);
   * ```
   */
  async generateVideoAndWait(request, pollInterval = 1e4, maxWaitTime = 3e5) {
    const startTime = Date.now();
    const response = await this.generateVideo(request);
    this.log("Video generation started", { operationId: response.id });
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getVideoStatus(response.id, request.appId);
      if (status.status === "completed") {
        this.log("Video generation completed", {
          operationId: response.id,
          videoUrl: status.video_url
        });
        return status;
      }
      if (status.status === "failed") {
        throw new Error(
          `Video generation failed: ${status.error || "Unknown error"}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    throw new Error(`Video generation timeout after ${maxWaitTime}ms`);
  }
  /**
   * Convenience method for simple video generation with structured parameters.
   *
   * This method provides a simplified interface for video generation using
   * a structured object that separates the prompt from other options.
   *
   * @param options - Object containing prompt and optional generation parameters
   * @returns Promise resolving to VideoGenerationResponse with operation ID
   *
   * @example
   * ```typescript
   * const response = await client.video.generate({
   *   prompt: "A futuristic city skyline at night",
   *   model: "google/veo-3.0-generate-preview",
   *   aspectRatio: "16:9",
   *   negativePrompt: "cartoon, low quality",
   *   appId: "my-app"
   * });
   * ```
   */
  async generate(options) {
    return this.generateVideo({
      model: options.model || "google/veo-3.0-generate-preview",
      prompt: options.prompt,
      parameters: {
        aspectRatio: options.aspectRatio,
        negativePrompt: options.negativePrompt
      },
      response_format: options.response_format || "mp4",
      user: options.user,
      appId: options.appId
    });
  }
  /**
   * Convenience method for video generation with default 16:9 aspect ratio.
   *
   * This method automatically sets the aspect ratio to 16:9 for widescreen
   * video generation.
   *
   * @param options - Object containing prompt and other parameters
   * @returns Promise resolving to VideoGenerationResponse with operation ID
   *
   * @example
   * ```typescript
   * const response = await client.video.generateWidescreen({
   *   prompt: "A cinematic car chase scene",
   *   negativePrompt: "cartoon, animation, low quality"
   * });
   * ```
   */
  async generateWidescreen(options) {
    return this.generate({
      ...options,
      aspectRatio: "16:9"
    });
  }
  /**
   * Convenience method for video generation with MP4 format.
   *
   * This method automatically sets the response format to MP4.
   *
   * @param options - Object containing prompt and other parameters
   * @returns Promise resolving to VideoGenerationResponse with operation ID
   *
   * @example
   * ```typescript
   * const response = await client.video.generateMP4({
   *   prompt: "A peaceful forest scene with birds",
   *   aspectRatio: "16:9"
   * });
   * ```
   */
  async generateMP4(options) {
    return this.generate({
      ...options,
      response_format: "mp4"
    });
  }
  /**
   * Generates a video and returns the final result with video URL.
   *
   * This method combines generation and status polling into a single call,
   * returning the completed video with URL.
   *
   * @param options - Video generation options
   * @param pollInterval - Interval in milliseconds between status checks (default: 10000)
   * @param maxWaitTime - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
   * @returns Promise resolving to VideoGenerationStatus with video URL
   *
   * @example
   * ```typescript
   * const result = await client.video.generateAndWait({
   *   prompt: "A majestic eagle soaring over mountains",
   *   aspectRatio: "16:9",
   *   negativePrompt: "cartoon, low quality"
   * });
   *
   * console.log("Video ready:", result.video_url);
   * ```
   */
  async generateAndWait(options, pollInterval = 1e4, maxWaitTime = 3e5) {
    const request = {
      model: options.model || "google/veo-3.0-generate-preview",
      prompt: options.prompt,
      parameters: {
        aspectRatio: options.aspectRatio,
        negativePrompt: options.negativePrompt
      },
      response_format: options.response_format || "mp4",
      user: options.user,
      appId: options.appId
    };
    return this.generateVideoAndWait(request, pollInterval, maxWaitTime);
  }
  /**
   * Validates video generation parameters for correctness.
   *
   * This static method performs validation on video generation parameters
   * to ensure they meet the API requirements before making requests.
   *
   * @param prompt - Text prompt for video generation
   * @param model - Model identifier
   * @param aspectRatio - Optional aspect ratio
   * @throws Error if parameters are invalid
   *
   * @example
   * ```typescript
   * VideoService.validateVideoGenerationParams(
   *   "A beautiful landscape",
   *   "google/veo-3.0-generate-preview",
   *   "16:9"
   * );
   * ```
   */
  static validateVideoGenerationParams(prompt, model, aspectRatio) {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt is required and cannot be empty");
    }
    if (!model || typeof model !== "string" || model.trim().length === 0) {
      throw new Error("Model is required and cannot be empty");
    }
    if (aspectRatio && aspectRatio !== "16:9") {
      throw new Error("Aspect ratio must be '16:9' or undefined");
    }
  }
};

// src/client/LunosClient.ts
var LunosClient = class _LunosClient {
  config;
  chatService;
  imageService;
  audioService;
  embeddingService;
  modelService;
  videoService;
  constructor(config = {}) {
    this.config = mergeConfig(config);
    this.validateConfig();
    this.initializeServices();
  }
  /**
   * Validates the client configuration
   */
  validateConfig() {
    ValidationUtils.validateApiKey(this.config.apiKey);
    ValidationUtils.validateBaseUrl(this.config.baseUrl);
    ValidationUtils.validateTimeout(this.config.timeout);
    ValidationUtils.validateRetryConfig(
      this.config.retries,
      this.config.retryDelay
    );
    ValidationUtils.validateFallbackModel(this.config.fallback_model);
  }
  /**
   * Initializes all services
   */
  initializeServices() {
    this.chatService = new ChatService(this.config);
    this.imageService = new ImageService(this.config);
    this.audioService = new AudioService(this.config);
    this.embeddingService = new EmbeddingService(this.config);
    this.modelService = new ModelService(this.config);
    this.videoService = new VideoService(this.config);
  }
  /**
   * Gets the chat service
   */
  get chat() {
    return this.chatService;
  }
  /**
   * Gets the image service
   */
  get image() {
    return this.imageService;
  }
  /**
   * Gets the audio service
   */
  get audio() {
    return this.audioService;
  }
  /**
   * Gets the embedding service
   */
  get embedding() {
    return this.embeddingService;
  }
  /**
   * Gets the model service
   */
  get models() {
    return this.modelService;
  }
  /**
   * Gets the video service
   */
  get video() {
    return this.videoService;
  }
  /**
   * Gets the current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Updates the client configuration
   */
  updateConfig(newConfig) {
    this.config = mergeConfig({ ...this.config, ...newConfig });
    this.validateConfig();
    this.initializeServices();
  }
  /**
   * Gets API usage information
   */
  async getUsage() {
    return this.chatService.getUsage();
  }
  /**
   * Gets account information
   */
  async getAccount() {
    return this.chatService.getAccount();
  }
  /**
   * Creates a new client instance with updated configuration
   */
  withConfig(newConfig) {
    return new _LunosClient({ ...this.config, ...newConfig });
  }
  /**
   * Creates a new client instance with a different API key
   */
  withApiKey(apiKey) {
    return new _LunosClient({ ...this.config, apiKey });
  }
  /**
   * Creates a new client instance with a different base URL
   */
  withBaseUrl(baseUrl) {
    return new _LunosClient({ ...this.config, baseUrl });
  }
  /**
   * Creates a new client instance with debug mode enabled
   */
  withDebug() {
    return new _LunosClient({ ...this.config, debug: true });
  }
  /**
   * Creates a new client instance with custom timeout
   */
  withTimeout(timeout) {
    return new _LunosClient({ ...this.config, timeout });
  }
  /**
   * Creates a new client instance with custom retry configuration
   */
  withRetryConfig(retries, retryDelay) {
    return new _LunosClient({ ...this.config, retries, retryDelay });
  }
  /**
   * Creates a new client instance with fallback model configuration
   */
  withFallbackModel(fallbackModel) {
    return new _LunosClient({ ...this.config, fallback_model: fallbackModel });
  }
  /**
   * Creates a new client instance with custom headers
   */
  withHeaders(headers) {
    return new _LunosClient({
      ...this.config,
      headers: { ...this.config.headers, ...headers }
    });
  }
  /**
   * Creates a new client instance with custom fetch implementation
   */
  withFetch(fetchImpl) {
    return new _LunosClient({ ...this.config, fetch: fetchImpl });
  }
  /**
   * Validates that the client is properly configured
   */
  validate() {
    this.validateConfig();
  }
  /**
   * Gets a string representation of the client
   */
  toString() {
    return `LunosClient(baseUrl: ${this.config.baseUrl}, debug: ${this.config.debug})`;
  }
};

export { APIError, AudioService, AuthenticationError, BaseService, ChatService, DEFAULT_CONFIG, EmbeddingService, FileUtils, ImageService, LunosClient, LunosError, ModelService, NetworkError, RateLimitError, StreamProcessor, ValidationError, ValidationUtils, VideoService, mergeConfig };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map