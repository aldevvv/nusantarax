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
import { CaptionsService } from './captions.service';
import { GenerateCaptionDto, AnalyzeImageDto, GeneratePlatformCaptionsDto, Platform, CaptionFormat } from './dto/generate-caption.dto';
import { CaptionPaginationDto, AnalyticsQueryDto } from './dto/caption-pagination.dto';

@Controller('captions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CaptionsController {
  constructor(private captionsService: CaptionsService) {}

  @Post('generate')
  async generateCaptions(
    @Body() generateDto: GenerateCaptionDto,
    @CurrentUser() user: any
  ): Promise<any> {
    try {
      const result = await this.captionsService.generateCaptions(
        generateDto,
        user.id
      );
      
      return {
        success: true,
        message: `Generated ${result.totalVariations} caption variations successfully`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate captions',
        error: error.message
      };
    }
  }

  // Analyze-only endpoint for simplified flow (upload → analysis only)
  @Post('analyze')
  async analyzeOnly(
    @Body() dto: AnalyzeImageDto,
    @CurrentUser() user: any
  ) {
    try {
      const analysis = await this.captionsService.analyzeProductWithAI(dto.imageData);
      return { success: true, data: { productAnalysis: analysis } };
    } catch (error) {
      return { success: false, message: 'Failed to analyze image', error: error.message };
    }
  }

  // Generate per-platform using existing analysis JSON; returns N variations
  @Post('generate-platform')
  async generatePerPlatform(
    @Body() dto: GeneratePlatformCaptionsDto,
    @CurrentUser() user: any
  ) {
    try {
      const count = Math.max(1, Math.min(30, Number(dto.count) || 3));
      const format: CaptionFormat = dto.format || (CaptionFormat.MEDIUM as any);
      const results = await this.captionsService.generatePlatformVariations(dto.analysis, dto.platform as Platform, format, count);
      return { success: true, data: { results, count } };
    } catch (error) {
      return { success: false, message: 'Failed to generate captions for platform', error: error.message };
    }
  }

  @Get('platforms')
  async getAvailablePlatforms() {
    try {
      const platforms = [
        {
          id: 'FACEBOOK',
          name: 'Facebook',
          description: 'Community-focused storytelling with strong engagement',
          features: ['Long-form content', 'Community building', 'Link sharing'],
          optimalLength: '200-300 characters',
          hashtagStrategy: '2-4 strategic hashtags'
        },
        {
          id: 'INSTAGRAM',
          name: 'Instagram',
          description: 'Visual-first platform with lifestyle integration',
          features: ['Visual storytelling', 'Hashtag discovery', 'Stories integration'],
          optimalLength: '125-150 characters',
          hashtagStrategy: '10-15 trending + niche hashtags'
        },
        {
          id: 'TIKTOK',
          name: 'TikTok',
          description: 'Viral content with trending elements',
          features: ['Viral potential', 'Trend integration', 'Challenge participation'],
          optimalLength: '80-120 characters',
          hashtagStrategy: '3-5 viral hashtags'
        }
      ];
      
      return {
        success: true,
        data: {
          platforms,
          count: platforms.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available platforms',
        error: error.message
      };
    }
  }

  @Get('formats')
  async getAvailableFormats() {
    try {
      const formats = [
        {
          id: 'SHORT',
          name: 'Short',
          description: 'Concise and impactful',
          includeHashtags: true
        },
        {
          id: 'MEDIUM',
          name: 'Medium',
          description: 'Balanced content with detail',
          includeHashtags: true
        },
        {
          id: 'LONG',
          name: 'Long',
          description: 'Comprehensive storytelling',
          includeHashtags: true
        },
        {
          id: 'SHORT_NO_HASHTAGS',
          name: 'Short (No Hashtags)',
          description: 'Clean text only',
          includeHashtags: false
        },
        {
          id: 'MEDIUM_NO_HASHTAGS',
          name: 'Medium (No Hashtags)',
          description: 'Detailed text only',
          includeHashtags: false
        },
        {
          id: 'LONG_NO_HASHTAGS',
          name: 'Long (No Hashtags)',
          description: 'Story-focused text only',
          includeHashtags: false
        }
      ];
      
      return {
        success: true,
        data: {
          formats,
          count: formats.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available formats',
        error: error.message
      };
    }
  }

  @Get('analytics')
  async getAnalytics(
    @CurrentUser() user: any,
    @Query() query: AnalyticsQueryDto
  ) {
    try {
      const analytics = await this.captionsService.getAnalytics(user.id, query);
      
      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      };
    }
  }

  @Get('requests')
  async getCaptionRequests(
    @CurrentUser() user: any,
    @Query() pagination: CaptionPaginationDto
  ) {
    try {
      const result = await this.captionsService.getCaptionRequests(
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
        message: 'Failed to fetch caption requests',
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
      const result = await this.captionsService.deleteRequest(
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

  @Get('insights')
  async getMarketInsights(@CurrentUser() user: any) {
    try {
      // Advanced insights for enterprise users
      const insights = {
        trendingHashtags: {
          facebook: ['#innovation', '#quality', '#lifestyle'],
          instagram: ['#aesthetic', '#inspo', '#viral', '#trending'],
          tiktok: ['#fyp', '#viral', '#mustwatch', '#trending']
        },
        optimalPostingTimes: {
          facebook: ['12:00-14:00', '18:00-20:00'],
          instagram: ['11:00-13:00', '17:00-19:00', '20:00-21:00'],
          tiktok: ['06:00-10:00', '19:00-22:00']
        },
        audienceInsights: {
          peakEngagementDays: ['Tuesday', 'Wednesday', 'Saturday'],
          contentPreferences: ['Visual storytelling', 'Behind-the-scenes', 'User-generated content'],
          engagementTriggers: ['Questions', 'Polls', 'Challenges']
        },
        competitorAnalysis: {
          avgCaptionLength: { facebook: 250, instagram: 140, tiktok: 95 },
          commonHashtags: ['#quality', '#lifestyle', '#innovation'],
          contentGaps: ['Educational content', 'User testimonials', 'Product comparisons']
        }
      };
      
      return {
        success: true,
        data: insights
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch market insights',
        error: error.message
      };
    }
  }
}
