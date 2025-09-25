import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ImageGeneratorService } from './image-generator.service';
import { CreateTemplateRequestDto } from './dto/create-template-request.dto';
import { CreateCustomRequestDto } from './dto/create-custom-request.dto';
import { GetHistoryQueryDto } from './dto/get-history-query.dto';

@Controller('image-generator')
@UseGuards(JwtAuthGuard)
export class ImageGeneratorController {
  constructor(private imageGeneratorService: ImageGeneratorService) {}

  @Get('templates')
  async getTemplates(@Query('category') category?: string) {
    try {
      const templates = await this.imageGeneratorService.getTemplates(category);
      
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch templates',
        error: error.message,
      };
    }
  }

  @Get('templates/categories')
  async getTemplateCategories() {
    try {
      const categories = await this.imageGeneratorService.getTemplateCategories();
      
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch template categories',
        error: error.message,
      };
    }
  }

  @Post('generate-template')
  async generateFromTemplate(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTemplateRequestDto,
  ) {
    try {
      const result = await this.imageGeneratorService.generateFromTemplate(userId, dto);
      
      return {
        success: true,
        message: 'Images generated successfully from template',
        data: {
          requestId: result.requestId,
          status: result.status,
          totalImages: result.totalImages,
          results: result.results,
          type: result.type,
          createdAt: result.createdAt,
          completedAt: result.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate images from template',
        error: error.message,
      };
    }
  }

  @Post('generate-custom')
  async generateFromCustom(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomRequestDto,
  ) {
    try {
      const result = await this.imageGeneratorService.generateFromCustom(userId, dto);
      
      return {
        success: true,
        message: 'Images generated successfully from custom prompt',
        data: {
          requestId: result.requestId,
          status: result.status,
          totalImages: result.totalImages,
          results: result.results,
          type: result.type,
          createdAt: result.createdAt,
          completedAt: result.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate images from custom prompt',
        error: error.message,
      };
    }
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query() query: GetHistoryQueryDto,
  ) {
    try {
      const result = await this.imageGeneratorService.getGenerationHistory(userId, query);
      
      return {
        success: true,
        data: result.requests,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch generation history',
        error: error.message,
      };
    }
  }

  @Get('request/:requestId')
  async getRequest(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    try {
      const request = await this.imageGeneratorService.getGenerationRequest(userId, requestId);
      
      return {
        success: true,
        data: request,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch generation request',
        error: error.message,
      };
    }
  }

  @Delete('result/:resultId')
  async deleteResult(
    @CurrentUser('id') userId: string,
    @Param('resultId') resultId: string,
  ) {
    try {
      const result = await this.imageGeneratorService.deleteGeneratedImage(userId, resultId);
      
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete generated image',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    try {
      const stats = await this.imageGeneratorService.getUserGenerationStats(userId);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch generation statistics',
        error: error.message,
      };
    }
  }
}