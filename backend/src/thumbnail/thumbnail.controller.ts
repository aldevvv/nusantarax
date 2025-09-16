import { 
  Controller, 
  Post,
  Get,
  Delete,
  Body, 
  Param,
  Query,
  UseGuards 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ThumbnailService } from './thumbnail.service';
import { GenerateThumbnailDto, GenerationResponse } from './dto/generate-thumbnail.dto';
import { ThumbnailPaginationDto } from './dto/thumbnail-pagination.dto';
import { GenerateThumbnailFromBriefDto } from './dto/generate-thumbnail-from-brief.dto';

@Controller('thumbnails')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ThumbnailController {
  constructor(private thumbnailService: ThumbnailService) {}

  @Post('generate')
  async generateThumbnails(
    @Body() generateDto: GenerateThumbnailDto,
    @CurrentUser() user: any
  ): Promise<any> {
    try {
      const result = await this.thumbnailService.generateThumbnails(
        generateDto,
        user.id
      );
      
      return {
        success: true,
        message: 'Thumbnails generated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate thumbnails',
        error: error.message
      };
    }
  }

  @Post('generate-from-brief')
  async generateFromBrief(
    @Body() dto: GenerateThumbnailFromBriefDto,
    @CurrentUser() user: any
  ) {
    try {
      const result = await this.thumbnailService.generateFromBrief(dto, user.id);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate thumbnails from brief',
        error: error.message,
      };
    }
  }

  @Get('prompts')
  async getAvailablePrompts() {
    try {
      const prompts = await this.thumbnailService.getAvailablePrompts();
      
      return {
        success: true,
        data: {
          prompts,
          count: prompts.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available prompts',
        error: error.message
      };
    }
  }

  @Get('statistics')
  async getUsageStatistics(@CurrentUser() user: any) {
    try {
      const stats = await this.thumbnailService.getUsageStatistics(user.id);
      
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

  @Get('requests')
  async getUserRequests(
    @CurrentUser() user: any,
    @Query() pagination: ThumbnailPaginationDto
  ) {
    try {
      const result = await this.thumbnailService.getUserRequests(
        user.id, 
        pagination
      );
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user requests',
        error: error.message
      };
    }
  }

  @Delete('requests/:id')
  async deleteRequest(
    @Param('id') requestId: string,
    @CurrentUser() user: any
  ) {
    try {
      const result = await this.thumbnailService.deleteRequest(
        requestId,
        user.id
      );
      
      return {
        success: true,
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete request',
        error: error.message
      };
    }
  }
}
