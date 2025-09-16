import { IsString, IsNotEmpty, IsArray, IsEnum, IsNumber, Max, Min, IsOptional } from 'class-validator';

export enum Platform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK'
}

export enum CaptionFormat {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  SHORT_NO_HASHTAGS = 'SHORT_NO_HASHTAGS',
  MEDIUM_NO_HASHTAGS = 'MEDIUM_NO_HASHTAGS',
  LONG_NO_HASHTAGS = 'LONG_NO_HASHTAGS'
}

export class GenerateCaptionDto {
  @IsString()
  @IsNotEmpty()
  imageData: string; // Base64 encoded image

  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms: Platform[]; // Selected platforms

  @IsArray()
  @IsEnum(CaptionFormat, { each: true })
  formats: CaptionFormat[]; // Selected formats

  @IsString()
  @IsNotEmpty()
  fileName: string; // Original filename

  @IsNumber()
  @Max(10485760) // 10MB limit
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string; // image/jpeg, image/png, etc.

  @IsOptional()
  @IsString()
  brandTone?: string; // Custom brand tone override

  @IsOptional()
  @IsString()
  targetAudience?: string; // Custom target audience override

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  count?: number; // desired number of variations per platform/format
}

export interface ProductAnalysis {
  productType: string;
  productCategory: string;
  visualElements: string[];
  targetAudience: string;
  brandTone: string;
  keyFeatures: string[];
  emotionalTriggers: string[];
  priceIndicator: 'budget' | 'mid-range' | 'premium' | 'luxury';
  marketingAngles: string[];
}

export interface CaptionGenerationResult {
  id: string;
  platform: Platform;
  format: CaptionFormat;
  version: number;
  caption: string;
  hashtags: string[];
  callToAction?: string;
  characterCount: number;
  engagementScore: number;
  viralPotential: number;
  conversionScore: number;
  audienceMatch: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  riskFactors: string[];
  createdAt: Date;
}

export interface CaptionGenerationResponse {
  success: boolean;
  requestId: string;
  productAnalysis: ProductAnalysis;
  results: CaptionGenerationResult[];
  totalVariations: number;
  processingTime: number;
  recommendations: {
    bestOverall: string; // ID of best performing caption
    bestPerPlatform: Record<Platform, string>;
    campaignStrategy: string[];
  };
}

// Analyze-only DTO to keep request minimal when only analysis is needed
export class AnalyzeImageDto {
  @IsString()
  @IsNotEmpty()
  imageData: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @Max(10485760)
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsOptional()
  @IsString()
  brandTone?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;
}

// Generate-per-platform DTO using existing analysis (no reupload of image)
export class GeneratePlatformCaptionsDto {
  @IsNotEmpty()
  analysis: ProductAnalysis;

  @IsEnum(Platform)
  platform: Platform;

  @IsOptional()
  @IsEnum(CaptionFormat)
  format?: CaptionFormat;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  count?: number;
}
