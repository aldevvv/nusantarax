import { IsString, IsOptional } from 'class-validator';

export class UpdateContextDto {
  @IsString()
  @IsOptional()
  globalContext?: string;
}