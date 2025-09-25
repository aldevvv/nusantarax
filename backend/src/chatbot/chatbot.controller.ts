import { Controller, Post, Get, Body, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ChatBotService } from './chatbot.service';
import { SendMessageDto } from './dto/send-message.dto';
import { LeadCaptureDto } from './dto/lead-capture.dto';

@Controller('chatbot')
@Public() // All chatbot endpoints are public
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Ip() userIp: string,
  ) {
    // Add user IP to the DTO for rate limiting
    sendMessageDto.userIp = userIp;
    
    try {
      const response = await this.chatBotService.sendMessage(sendMessageDto);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name || 'ChatBotError',
      };
    }
  }

  @Post('lead-capture')
  @HttpCode(HttpStatus.OK)
  async captureLeads(
    @Body() leadCaptureDto: LeadCaptureDto,
    @Ip() userIp: string,
  ) {
    // Add user IP to the DTO for tracking
    leadCaptureDto.userIp = userIp;
    
    try {
      const response = await this.chatBotService.captureLeads(leadCaptureDto);
      return {
        success: response.success,
        message: response.message,
        data: response.success ? { leadId: response.leadId } : null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to capture lead. Please try again.',
        error: error.name || 'LeadCaptureError',
      };
    }
  }

  @Get('suggested-questions')
  @HttpCode(HttpStatus.OK)
  async getSuggestedQuestions() {
    try {
      const questions = this.chatBotService.getSuggestedQuestions();
      return {
        success: true,
        data: questions,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get suggested questions',
        error: error.name || 'SuggestedQuestionsError',
      };
    }
  }

  @Get('session/stats')
  @HttpCode(HttpStatus.OK)
  async getSessionStats() {
    try {
      const stats = this.chatBotService.getSessionStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get session stats',
        error: error.name || 'SessionStatsError',
      };
    }
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      success: true,
      message: 'ChatBot service is healthy',
      timestamp: new Date().toISOString(),
      service: 'NusantaraX ChatBot',
    };
  }
}