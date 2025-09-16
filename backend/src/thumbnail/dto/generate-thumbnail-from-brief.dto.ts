import { IsString, IsOptional, IsIn, IsArray, IsNumber, Min, Max } from 'class-validator';

export class GenerateThumbnailFromBriefDto {
  @IsString()
  productName: string;

  @IsString()
  productDescription: string;

  @IsOptional()
  @IsString()
  productCategory?: string;

  @IsOptional()
  @IsString()
  packaging?: string;

  @IsOptional()
  @IsIn([
    'ecommerce_white',
    'lifestyle_minimal',
    'lifestyle_vibrant',
    'catalog_neutral',
    'premium_luxury',
    'organic_natural',
    'tech_modern',
  ])
  stylePreset?: string;

  @IsOptional()
  @IsIn(['white', 'lifestyle', 'neutral_gray'])
  background?: string;

  @IsOptional()
  @IsArray()
  palette?: string[];

  @IsOptional()
  @IsIn(['natural', 'vivid'])
  tone?: 'natural' | 'vivid';

  @IsOptional()
  @IsIn(['close', 'mid', 'wide'])
  framing?: string;

  @IsOptional()
  @IsIn(['eye', '45', 'top'])
  angle?: string;

  @IsOptional()
  @IsString()
  lighting?: string;

  @IsOptional()
  @IsIn(['ecommerce', 'instagram', 'ads', 'marketplace'])
  platform?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  count?: number;

  @IsOptional()
  @IsNumber()
  width?: number; // default 1080

  @IsOptional()
  @IsNumber()
  height?: number; // default 1350

  @IsOptional()
  @IsString()
  finalPromptOverride?: string;
}

export interface BuiltPromptDTO {
  final_prompt: string;
  negative_prompt?: string;
  style: { preset?: string; style_param?: 'vivid' | 'natural' };
  output: { width: number; height: number; count: number; quality: 'hd' | 'standard' };
}
