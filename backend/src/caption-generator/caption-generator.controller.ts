import {
  Controller,
  Get,
  Post,
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
import { CaptionGeneratorService } from './caption-generator.service';
import { CreateCaptionRequestDto } from './dto/create-caption-request.dto';
import { GetCaptionHistoryQueryDto } from './dto/get-caption-history-query.dto';

@Controller('caption-generator')
@UseGuards(JwtAuthGuard)
export class CaptionGeneratorController {
  constructor(private captionGeneratorService: CaptionGeneratorService) {}

  @Post('generate')
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
  async generateCaptions(
    @CurrentUser('id') userId: string,
    @UploadedFile() imageFile: Express.Multer.File,
    @Body() dto: CreateCaptionRequestDto,
  ) {
    try {
      if (!imageFile) {
        throw new BadRequestException('Image file is required');
      }

      // 🔍 DEBUG: Log received data to track language parameter
      console.log('🔍 DEBUG Controller Received Data:', {
        userId,
        dtoKeys: Object.keys(dto),
        language: dto.language,
        languageType: typeof dto.language,
        platform: dto.platform,
        tone: dto.tone,
        rawDto: dto
      });

      const result = await this.captionGeneratorService.generateCaptionsWithAnalysis(userId, {
        ...dto,
        imageFile,
      });
      
      return {
        success: true,
        message: 'Captions generated successfully',
        data: {
          requestId: result.requestId,
          status: result.status,
          totalCaptions: result.totalCaptions,
          results: result.results,
          imageUrl: result.imageUrl,
          platform: result.platform,
          createdAt: result.createdAt,
          completedAt: result.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate captions',
        error: error.message,
      };
    }
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query() query: GetCaptionHistoryQueryDto,
  ) {
    try {
      const result = await this.captionGeneratorService.getCaptionHistory(userId, query);
      
      return {
        success: true,
        data: result.requests,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch caption history',
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
      const request = await this.captionGeneratorService.getCaptionRequest(userId, requestId);
      
      return {
        success: true,
        data: request,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch caption request',
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
      const result = await this.captionGeneratorService.deleteCaptionResult(userId, resultId);
      
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete caption',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getStats(@CurrentUser('id') userId: string) {
    try {
      const stats = await this.captionGeneratorService.getUserCaptionStats(userId);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch caption statistics',
        error: error.message,
      };
    }
  }
}