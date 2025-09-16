import { IsString, IsNotEmpty, IsArray, IsOptional, IsIn, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OptimizationSettings {
  @IsOptional()
  @IsString()
  smartCrop?: string; // 'auto', 'center', 'face', 'object'

  @IsOptional()
  @IsString()
  backgroundRemoval?: string; // 'none', 'remove', 'replace'

  @IsOptional()
  @IsString()
  backgroundReplacement?: string; // 'white', 'transparent', 'gradient', 'custom'

  @IsOptional()
  @IsString()
  lightingAdjustment?: string; // 'none', 'auto', 'enhance', 'dramatic'

  @IsOptional()
  @IsString()
  colorCorrection?: string; // 'none', 'auto', 'vibrant', 'natural'

  @IsOptional()
  @IsString()
  textPlacement?: string; // 'none', 'auto', 'top', 'bottom', 'center'

  @IsOptional()
  @IsString()
  textContent?: string; // Custom text to add

  @IsOptional()
  @IsString()
  aspectRatio?: string; // '1:1', '16:9', '9:16', '4:3', 'original'

  @IsOptional()
  @IsString()
  qualityLevel?: string; // 'standard', 'high', 'premium'
}

export class OptimizeThumbnailDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  imageData: string; // Base64 encoded image

  @IsString()
  @IsNotEmpty()
  @IsIn(['social-media', 'ecommerce', 'catalog', 'marketing', 'product-showcase', 'umkm-focused'])
  templateId: string;

  @IsArray()
  @IsString({ each: true })
  @IsIn(['JPG', 'PNG', 'WEBP'], { each: true })
  exportFormats: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => OptimizationSettings)
  optimizations: OptimizationSettings;

  @IsOptional()
  @IsString()
  customPrompt?: string; // Override AI prompt
}

export interface OptimizeResult {
  id: string;
  templateUsed: string;
  format: string;
  imageUrl: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  optimizationsApplied: any;
  qualityScore?: number;
  improvementNotes: string[];
  createdAt: string;
}

export interface OptimizeResponse {
  success: boolean;
  requestId: string;
  results: OptimizeResult[];
  processingTime: number;
  originalSize: number;
  totalOptimizedSize: number;
  compressionRatio: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  optimizations: Partial<OptimizationSettings>;
  supportedFormats: string[];
}