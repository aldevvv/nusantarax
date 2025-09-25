import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, BillingCycle } from '@prisma/client';
import { BillingService } from './billing.service';
import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { fixRequestTracking } from '../scripts/fix-request-tracking';

class UpgradePlanDto {
  @IsString()
  planId: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

class ToggleAutoRenewDto {
  @IsBoolean()
  enabled: boolean;
}

class CancelSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  immediately?: boolean;
}

class UpgradePreviewDto {
  @IsString()
  planId: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('overview')
  async getBillingOverview(@Request() req) {
    try {
      const overview = await this.billingService.getBillingOverview(req.user.id);
      
      return {
        success: true,
        data: overview,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch billing overview',
        error: error.message,
      };
    }
  }

  @Get('history')
  async getBillingHistory(
    @Request() req,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    try {
      const history = await this.billingService.getBillingHistory(
        req.user.id,
        limit,
        offset,
      );
      
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch billing history',
        error: error.message,
      };
    }
  }

  @Get('usage')
  async getUsageStats(
    @Request() req,
    @Query('timeframe') timeframe: 'month' | 'week' | 'today' = 'month',
  ) {
    try {
      const usage = await this.billingService.getUsageStats(req.user.id, timeframe);
      
      return {
        success: true,
        data: usage,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch usage statistics',
        error: error.message,
      };
    }
  }

  @Get('subscription')
  async getCurrentSubscription(@Request() req) {
    try {
      const subscription = await this.billingService.getCurrentSubscription(req.user.id);
      
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subscription details',
        error: error.message,
      };
    }
  }

  @Get('errors')
  async getRecentErrors(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const errors = await this.billingService.getRecentErrors(req.user.id, limit);
      
      return {
        success: true,
        data: errors,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch recent errors',
        error: error.message,
      };
    }
  }

  @Get('plans')
  async getAllPlans() {
    try {
      const plans = await this.billingService.getAllPlans();
      
      return {
        success: true,
        data: plans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subscription plans',
        error: error.message,
      };
    }
  }

  @Get('upgrade-preview')
  async getUpgradePreview(
    @Request() req,
    @Query('planId') planId: string,
    @Query('billingCycle') billingCycle: BillingCycle = 'MONTHLY'
  ) {
    try {
      const preview = await this.billingService.getUpgradePreview(
        req.user.id,
        planId,
        billingCycle
      );
      
      return {
        success: true,
        data: preview,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate upgrade preview',
        error: error.message,
      };
    }
  }

  @Get('validate-upgrade')
  async validateUpgradeRequest(
    @Request() req,
    @Query('planId') planId: string,
    @Query('billingCycle') billingCycle: BillingCycle = 'MONTHLY'
  ) {
    try {
      const validation = await this.billingService.validateUpgradeRequest(
        req.user.id,
        planId,
        billingCycle
      );
      
      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate upgrade request',
        error: error.message,
      };
    }
  }

  @Get('plan-hierarchy')
  async getPlanHierarchy() {
    try {
      const hierarchy = await this.billingService.getPlanHierarchy();
      
      return {
        success: true,
        data: hierarchy,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch plan hierarchy',
        error: error.message,
      };
    }
  }

  @Post('validate-upgrade')
  async validateUpgrade(@Request() req, @Body() validateDto: UpgradePreviewDto) {
    try {
      const validation = await this.billingService.validateUpgradeRequest(
        req.user.id,
        validateDto.planId,
        validateDto.billingCycle
      );
      
      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate upgrade',
        error: error.message,
      };
    }
  }

  @Post('upgrade')
  async upgradePlan(@Request() req, @Body() upgradeDto: UpgradePlanDto) {
    try {
      const result = await this.billingService.upgradePlan(
        req.user.id,
        upgradeDto.planId,
        upgradeDto.billingCycle
      );
      
      return {
        success: true,
        message: 'Plan upgraded successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upgrade plan',
        error: error.message,
      };
    }
  }

  @Put('auto-renew')
  async toggleAutoRenew(@Request() req, @Body() toggleDto: ToggleAutoRenewDto) {
    try {
      const subscription = await this.billingService.toggleAutoRenew(
        req.user.id,
        toggleDto.enabled
      );
      
      return {
        success: true,
        message: `Auto-renew ${toggleDto.enabled ? 'enabled' : 'disabled'} successfully`,
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to toggle auto-renew',
        error: error.message,
      };
    }
  }

  @Post('process-auto-renew')
  async processAutoRenew(@Request() req) {
    try {
      const result = await this.billingService.processAutoRenew(req.user.id);
      
      return {
        success: result.success,
        message: result.message,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process auto-renewal',
        error: error.message,
      };
    }
  }

  @Post('cancel')
  async cancelSubscription(@Request() req, @Body() cancelDto: CancelSubscriptionDto) {
    try {
      const result = await this.billingService.cancelSubscription(
        req.user.id,
        cancelDto.immediately || false
      );
      
      return {
        success: true,
        message: result.message,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to cancel subscription',
        error: error.message,
      };
    }
  }
}
