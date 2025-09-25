import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTemplateRequestDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  @IsNotEmpty()
  inputFields: Record<string, any>;

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