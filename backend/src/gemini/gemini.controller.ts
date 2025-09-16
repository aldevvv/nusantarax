import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GeminiService } from './gemini.service';
import { IsString, IsNotEmpty } from 'class-validator';

class UpdateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

@Controller('gemini')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GeminiController {
  constructor(private geminiService: GeminiService) {}

  @Get('status')
  async getApiKeyStatus() {
    try {
      const status = await this.geminiService.checkApiKeyStatus();
      
      return {
        success: true,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check API key status',
        error: error.message
      };
    }
  }

  @Get('models')
  async getAvailableModels() {
    try {
      const result = await this.geminiService.getAvailableModels();
      
      return {
        success: true,
        data: {
          models: result.models,
          count: result.models.length,
          source: result.source,
          timestamp: result.timestamp,
          message: result.message || undefined
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available models',
        error: error.message
      };
    }
  }

  @Get('usage')
  async getUsageStats() {
    try {
      const stats = await this.geminiService.getApiStatistics();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch usage statistics',
        error: error.message
      };
    }
  }

  @Get('statistics')
  async getApiStatistics() {
    try {
      const stats = await this.geminiService.getApiStatistics('month');
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('recent-errors')
  async getRecentErrors() {
    try {
      const errors = await this.geminiService.getRecentErrors();
      return {
        success: true,
        data: errors
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('test-key')
  async testApiKey(@Body() updateApiKeyDto: UpdateApiKeyDto) {
    try {
      const result = await this.geminiService.testApiKey(updateApiKeyDto.apiKey);
      
      return {
        success: result.isValid,
        message: result.message,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to test API key',
        error: error.message
      };
    }
  }

  @Post('update-key')
  async updateApiKeyLegacy(@Body() updateApiKeyDto: UpdateApiKeyDto) {
    try {
      const result = await this.geminiService.updateApiKeyLegacy(updateApiKeyDto.apiKey);
      
      return {
        success: true,
        message: result.message,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update API key',
        error: error.message
      };
    }
  }
}