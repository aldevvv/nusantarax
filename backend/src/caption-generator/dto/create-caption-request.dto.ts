import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum CaptionPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK'
}

export enum CaptionTone {
  PROFESSIONAL = 'PROFESSIONAL',
  CASUAL = 'CASUAL',
  FUNNY = 'FUNNY',
  INSPIRING = 'INSPIRING',
  SALES = 'SALES',
  EDUCATIONAL = 'EDUCATIONAL',
  STORYTELLING = 'STORYTELLING'
}

export enum CaptionLength {
  SHORT = 'SHORT',    // 50-100 characters
  MEDIUM = 'MEDIUM',  // 150-250 characters
  LONG = 'LONG'       // 350+ characters
}

export enum CaptionLanguage {
  EN = 'EN',     // English
  ID = 'ID'      // Bahasa Indonesia
}

export class CreateCaptionRequestDto {
  @IsString()
  @IsOptional()
  captionIdea?: string;

  @IsEnum(CaptionPlatform)
  platform: CaptionPlatform;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsEnum(CaptionTone)
  tone: CaptionTone;

  @IsEnum(CaptionLength)
  captionLength: CaptionLength;

  @IsEnum(CaptionLanguage)
  @IsOptional()
  language?: CaptionLanguage;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  useEmojis?: boolean = true;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  useHashtags?: boolean = true;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  includeBusinessInfo?: boolean = false;
}