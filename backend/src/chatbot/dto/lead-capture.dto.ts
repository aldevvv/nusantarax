import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class LeadCaptureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Full name too long. Maximum 100 characters allowed.' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number too long. Maximum 20 characters allowed.' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Company name too long. Maximum 100 characters allowed.' })
  company?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userIp?: string;
}

export class LeadCaptureResponseDto {
  success: boolean;
  message: string;
  leadId?: string;
}