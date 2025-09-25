import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCaptionHistoryQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @IsEnum(['PROCESSING', 'ANALYZING_IMAGE', 'GENERATING_CAPTIONS', 'ANALYZING_CAPTIONS', 'COMPLETED', 'FAILED'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK'])
  platform?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;
}