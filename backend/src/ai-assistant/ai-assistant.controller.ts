import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiAssistantService } from './ai-assistant.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateContextDto } from './dto/update-context.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  constructor(private aiAssistantService: AiAssistantService) {}

  @Post('send-message')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async sendMessage(
    @CurrentUser('id') userId: string,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body() dto: SendMessageDto,
  ) {
    try {
      const result = await this.aiAssistantService.sendMessage(userId, dto, imageFile);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send message to AI Assistant',
        error: error.message,
      };
    }
  }

  @Get('session')
  async getSession(@CurrentUser('id') userId: string) {
    try {
      const result = await this.aiAssistantService.getOrCreateSession(userId);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get AI Assistant session',
        error: error.message,
      };
    }
  }

  @Get('messages')
  async getMessages(
    @CurrentUser('id') userId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    try {
      const result = await this.aiAssistantService.getMessages(userId, query);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch messages',
        error: error.message,
      };
    }
  }

  @Put('context')
  async updateContext(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateContextDto,
  ) {
    try {
      const result = await this.aiAssistantService.updateContext(userId, dto);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update context',
        error: error.message,
      };
    }
  }

  @Get('context')
  async getContext(@CurrentUser('id') userId: string) {
    try {
      const result = await this.aiAssistantService.getContext(userId);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get context',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    try {
      const stats = await this.aiAssistantService.getUsageStats(userId);
      
      return stats;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch AI Assistant statistics',
        error: error.message,
      };
    }
  }

  @Delete('clear')
  async clearSession(@CurrentUser('id') userId: string) {
    try {
      const result = await this.aiAssistantService.clearSession(userId);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to clear chat session',
        error: error.message,
      };
    }
  }

  @Delete('message/:messageId')
  async deleteMessage(
    @CurrentUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    try {
      const result = await this.aiAssistantService.deleteMessage(userId, messageId);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete message',
        error: error.message,
      };
    }
  }
}