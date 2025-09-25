import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Database retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 100, // Start with 100ms
  maxDelay: 2000, // Cap at 2 seconds
  retryableErrors: [
    'P1000', // Authentication failed
    'P1001', // Can't reach database server
    'P1002', // Database server timeout
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN'
  ]
};

// Check if error is retryable
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorCode = error.code;
  const errorMessage = error.message?.toLowerCase() || '';

  // Check Prisma error codes
  if (errorCode && RETRY_CONFIG.retryableErrors.includes(errorCode)) {
    return true;
  }

  // Check network errors
  if (RETRY_CONFIG.retryableErrors.some(code =>
    errorMessage.includes(code.toLowerCase())
  )) {
    return true;
  }

  // Check for connection-related errors
  if (errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network')) {
    return true;
  }

  return false;
}

// Calculate delay with exponential backoff and jitter
function calculateDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelay);
}

// Enhanced Prisma client with retry logic
class PrismaClientWithRetry extends PrismaClient {
  constructor(options?: any) {
    super({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
      ...options
    });
  }

  async $connect(): Promise<void> {
    return this.executeWithRetry(() => super.$connect());
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context = 'database operation'
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === RETRY_CONFIG.maxRetries) {
          break;
        }

        // Only retry if error is retryable
        if (!isRetryableError(error)) {
          break;
        }

        const delay = calculateDelay(attempt);
        console.warn(
          `Database ${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}): ${error.message}. Retrying in ${delay}ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Log final failure
    console.error(
      `Database ${context} failed after ${RETRY_CONFIG.maxRetries + 1} attempts:`,
      lastError
    );
    throw lastError;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientWithRetry();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Export types and utilities for testing
export { isRetryableError, RETRY_CONFIG };