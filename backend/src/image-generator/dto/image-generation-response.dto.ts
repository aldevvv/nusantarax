import { ImageRequestStatus } from '@prisma/client';

export class ImageGenerationResultDto {
  id: string;
  imageUrl: string;
  imageSize?: string;
  fileSize?: number;
  fileName: string;
  prompt: string;
  seed?: string;
  generationTime?: number;
  order: number;
  createdAt: Date;
}

export class ImageGenerationResponseDto {
  id: string;
  requestId: string;
  type: string;
  status: ImageRequestStatus;
  originalPrompt: string;
  enhancedPrompt: string;
  includeBusinessInfo: boolean;
  businessContext?: string;
  style?: string;
  backgroundPreference?: string;
  analysisModel?: string;
  generationModel?: string;
  analysisInputTokens?: number;
  analysisOutputTokens?: number;
  analysisTokens?: number;
  generationTokens?: number;
  totalTokens?: number;
  totalImages: number;
  results: ImageGenerationResultDto[];
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class GenerationHistoryQueryDto {
  page?: number = 1;
  limit?: number = 10;
  status?: ImageRequestStatus;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}