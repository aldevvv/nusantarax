import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, TrialStatus } from '@prisma/client';
import { TrialService } from './trial.service';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';

class CreateTrialConfigDto {
  @IsString()
  planId: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  trialDays: number;

  @IsNumber()
  @Min(1)
  maxTrialUsers: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateTrialConfigDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  trialDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTrialUsers?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('trial')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Get('configurations')
  async getAllTrialConfigurations() {
    try {
      const configs = await this.trialService.getAllTrialConfigurations();
      return {
        success: true,
        data: configs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch trial configurations',
        error: error.message,
      };
    }
  }

  @Post('configurations')
  async createTrialConfiguration(@Body() dto: CreateTrialConfigDto, @Request() req) {
    try {
      const config = await this.trialService.createTrialConfiguration({
        ...dto,
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        createdBy: req.user.id,
      });
      
      return {
        success: true,
        message: 'Trial configuration created successfully',
        data: config,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create trial configuration',
        error: error.message,
      };
    }
  }

  @Put('configurations/:id')
  async updateTrialConfiguration(@Param('id') id: string, @Body() dto: UpdateTrialConfigDto) {
    try {
      const updateData: any = { ...dto };
      
      // Convert date strings to Date objects if provided
      if (dto.validFrom) updateData.validFrom = new Date(dto.validFrom);
      if (dto.validUntil) updateData.validUntil = new Date(dto.validUntil);

      const config = await this.trialService.updateTrialConfiguration(id, updateData);
      
      return {
        success: true,
        message: 'Trial configuration updated successfully',
        data: config,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update trial configuration',
        error: error.message,
      };
    }
  }

  @Delete('configurations/:id')
  async deleteTrialConfiguration(@Param('id') id: string) {
    try {
      await this.trialService.deleteTrialConfiguration(id);
      
      return {
        success: true,
        message: 'Trial configuration deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete trial configuration',
        error: error.message,
      };
    }
  }

  @Get('statistics')
  async getTrialStatistics(@Query('configId') configId?: string) {
    try {
      const stats = await this.trialService.getTrialStatistics(configId);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch trial statistics',
        error: error.message,
      };
    }
  }

  @Get('plans/available')
  async getAvailablePlans() {
    try {
      const plans = await this.trialService.getAvailablePlans();
      return {
        success: true,
        data: plans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch available plans',
        error: error.message,
      };
    }
  }

  @Get('plans/all')
  async getAllPlansWithTrialStatus() {
    try {
      const plans = await this.trialService.getAllPlansWithTrialStatus();
      return {
        success: true,
        data: plans,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch plans with trial status',
        error: error.message,
      };
    }
  }

  @Get('history')
  async getTrialHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('planId') planId?: string,
    @Query('status') status?: TrialStatus,
    @Query('converted') converted?: string,
  ) {
    try {
      const filters: any = {};
      if (planId) filters.planId = planId;
      if (status) filters.status = status;
      if (converted !== undefined) filters.converted = converted === 'true';

      const result = await this.trialService.getTrialHistory(page, limit, filters);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch trial history',
        error: error.message,
      };
    }
  }
}
