import { IsOptional, IsNumber, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

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

export class CaptionPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsEnum(CaptionFormat)
  format?: CaptionFormat;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'overallScore' | 'engagementScore' | 'viralPotential';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  period?: 'day' | 'week' | 'month' | 'year';

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}