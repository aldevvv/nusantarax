import { IsString, IsNotEmpty, IsOptional, IsIP, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Message too long. Maximum 500 characters allowed.' })
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userIp?: string;
}

export class ChatBotResponseDto {
  message: string;
  detectedLanguage: 'ID' | 'EN';
  sessionId: string;
  suggestedQuestions?: string[];
  showLeadCapture?: boolean;
  metadata: {
    responseTime: number;
    model: string;
    tokenUsage: number;
  };
}