import { Controller, Get, Patch, Param, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminPlansService } from './admin-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Plans')
@ApiBearerAuth()
@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPlansController {
  constructor(private readonly adminPlansService: AdminPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans with statistics' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAllPlans() {
    try {
      const plans = await this.adminPlansService.getAllPlansWithStats();
      return {
        success: true,
        data: plans,
        message: 'Plans retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve plans',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getPlanById(@Param('id') id: string) {
    try {
      const plan = await this.adminPlansService.getPlanById(id);
      if (!plan) {
        throw new HttpException(
          {
            success: false,
            message: 'Plan not found'
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: plan,
        message: 'Plan retrieved successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve plan',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async updatePlan(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string;
      displayName?: string;
      description?: string;
      monthlyRequests?: number;
      monthlyPrice?: number;
      yearlyPrice?: number;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    try {
      // Validate input
      if (updateData.monthlyRequests !== undefined && updateData.monthlyRequests < -1) {
        throw new HttpException(
          {
            success: false,
            message: 'Monthly requests must be -1 (unlimited) or positive number'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (updateData.monthlyPrice !== undefined && updateData.monthlyPrice < 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Monthly price must be a positive number'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (updateData.yearlyPrice !== undefined && updateData.yearlyPrice < 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Yearly price must be a positive number'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const updatedPlan = await this.adminPlansService.updatePlan(id, updateData);
      
      return {
        success: true,
        data: updatedPlan,
        message: 'Plan updated successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update plan',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get plan usage statistics' })
  @ApiResponse({ status: 200, description: 'Plan statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getPlanStats(@Param('id') id: string) {
    try {
      const stats = await this.adminPlansService.getPlanUsageStats(id);
      return {
        success: true,
        data: stats,
        message: 'Plan statistics retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve plan statistics',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('comparison/data')
  @ApiOperation({ summary: 'Get plans comparison data' })
  @ApiResponse({ status: 200, description: 'Plans comparison data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getPlansComparison() {
    try {
      const comparison = await this.adminPlansService.getPlansComparison();
      return {
        success: true,
        data: comparison,
        message: 'Plans comparison data retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve plans comparison',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('subscription-counts/data')
  @ApiOperation({ summary: 'Get subscription counts for all plans' })
  @ApiResponse({ status: 200, description: 'Subscription counts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getSubscriptionCounts() {
    try {
      const counts = await this.adminPlansService.getSubscriptionCounts();
      return {
        success: true,
        data: counts,
        message: 'Subscription counts retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve subscription counts',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}