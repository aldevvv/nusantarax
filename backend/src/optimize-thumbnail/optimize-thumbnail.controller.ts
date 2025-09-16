import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptimizeThumbnailService } from './optimize-thumbnail.service';
import { OptimizeThumbnailDto, OptimizeResponse, Template } from './dto/optimize-thumbnail.dto';
import type { AuthenticatedUser } from '../auth/types/auth.types';

@Controller('optimize-thumbnail')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OptimizeThumbnailController {
  constructor(private readonly optimizeThumbnailService: OptimizeThumbnailService) {}

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for optimization
  async optimizeThumbnail(
    @Body() optimizeThumbnailDto: OptimizeThumbnailDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OptimizeResponse> {
    return this.optimizeThumbnailService.optimizeThumbnail(optimizeThumbnailDto, user.id);
  }

  @Get('templates')
  @Roles('ADMIN')
  async getAvailableTemplates(): Promise<Template[]> {
    return this.optimizeThumbnailService.getAvailableTemplates();
  }

  @Get('requests')
  @Roles('ADMIN')
  async getUserRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.optimizeThumbnailService.getUserRequests(user.id, pageNum, limitNum);
  }

  @Get('statistics')
  @Roles('ADMIN')
  async getUsageStatistics(@CurrentUser() user: AuthenticatedUser) {
    return this.optimizeThumbnailService.getUsageStatistics(user.id);
  }

  @Get('statistics/global')
  @Roles('ADMIN')
  async getGlobalStatistics() {
    return this.optimizeThumbnailService.getUsageStatistics();
  }

  @Delete('requests/:id')
  @Roles('ADMIN')
  async deleteRequest(
    @Param('id') requestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.optimizeThumbnailService.deleteRequest(requestId, user.id);
  }
}