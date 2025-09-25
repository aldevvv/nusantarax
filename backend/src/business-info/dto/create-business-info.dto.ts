import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsIn } from 'class-validator';

export class CreateBusinessInfoDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsArray()
  @IsString({ each: true })
  brandColors: string[];

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  @IsIn(['B2C', 'B2B', 'B2B2C', 'Marketplace'])
  businessModel?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MICRO', 'SMALL', 'MEDIUM', 'LARGE'])
  businessSize?: string;

  @IsOptional()
  @IsNumber()
  establishedYear?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mainProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyServices?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['Professional', 'Casual', 'Friendly', 'Authoritative'])
  brandVoice?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandPersonality?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  socialMedia?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessGoals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketingFocus?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['Professional', 'Casual', 'Humorous', 'Educational'])
  contentTone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['id', 'en'])
  preferredLanguage?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}