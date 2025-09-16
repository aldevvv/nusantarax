import { IsString, IsNotEmpty, IsNumber, Max, IsIn } from 'class-validator';

export class GenerateThumbnailDto {
  @IsString()
  @IsNotEmpty()
  imageData: string; // Base64 encoded image

  @IsString()
  @IsNotEmpty()
  @IsIn(['ecommerce-shot', 'social-media', 'catalog-image'])
  promptId: string; // ID of selected prompt

  @IsString()
  @IsNotEmpty()
  fileName: string; // Original filename

  @IsNumber()
  @Max(10485760) // 10MB limit
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string; // image/jpeg, image/png, etc.
}

export interface ThumbnailGenerationResult {
  id: string;
  order: number;
  promptTitle: string;
  promptVariation: string;
  resultText: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface GenerationResponse {
  success: boolean;
  requestId: string;
  results: ThumbnailGenerationResult[];
  processingTime: number;
}
