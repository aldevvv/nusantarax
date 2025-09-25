import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsBoolean()
  @IsOptional()
  includeBusinessInfo?: boolean = false;

  @IsString()
  @IsOptional()
  style?: string;

  @IsString()
  @IsOptional()
  backgroundPreference?: string;

  @IsString()
  @IsOptional()
  @IsIn(['1:1', '3:4', '9:16', '16:9'])
  aspectRatio?: string = '3:4';

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  imageCount?: number = 3;
}