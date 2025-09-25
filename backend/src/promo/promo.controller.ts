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
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PromoService } from './promo.service';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsEnum, 
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength
} from 'class-validator';

class CreatePromoCodeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  discountType: 'PERCENTAGE' | 'FIXED';

  @IsNumber()
  @Min(1)
  discountValue: number;

  @IsNumber()
  @Min(-1)
  maxUsage: number;

  @IsNumber()
  @Min(1)
  maxUsagePerUser: number;

  @IsNumber()
  @Min(-1)
  maxTotalUsers: number;

  @IsEnum(['TOPUP', 'PLAN', 'BOTH'])
  applicableFor: 'TOPUP' | 'PLAN' | 'BOTH';

  @IsBoolean()
  isActive: boolean;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;
}

class UpdatePromoCodeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  maxUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsagePerUser?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  maxTotalUsers?: number;

  @IsOptional()
  @IsEnum(['TOPUP', 'PLAN', 'BOTH'])
  applicableFor?: 'TOPUP' | 'PLAN' | 'BOTH';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;
}

@Controller('promo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Only admin can manage promo codes
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Post()
  async createPromoCode(@Body() createPromoDto: CreatePromoCodeDto, @Request() req) {
    try {
      const promoCode = await this.promoService.createPromoCode(
        {
          ...createPromoDto,
          validFrom: new Date(createPromoDto.validFrom),
          validUntil: new Date(createPromoDto.validUntil),
          discountType: createPromoDto.discountType as any,
          applicableFor: createPromoDto.applicableFor,
        },
        req.user.id
      );

      return {
        success: true,
        message: 'Promo code created successfully',
        data: promoCode,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create promo code',
        error: error.message,
      };
    }
  }

  @Get()
  async getAllPromoCodes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean
  ) {
    try {
      const result = await this.promoService.getAllPromoCodes(page, limit, activeOnly);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch promo codes',
        error: error.message,
      };
    }
  }

  @Get(':id')
  async getPromoCodeById(@Param('id') id: string) {
    try {
      const promoCode = await this.promoService.getPromoCodeById(id);
      
      return {
        success: true,
        data: promoCode,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch promo code',
        error: error.message,
      };
    }
  }

  @Get(':id/stats')
  async getPromoCodeStats(@Param('id') id: string) {
    try {
      const stats = await this.promoService.getPromoCodeStats(id);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch promo code statistics',
        error: error.message,
      };
    }
  }

  @Put(':id')
  async updatePromoCode(
    @Param('id') id: string,
    @Body() updatePromoDto: UpdatePromoCodeDto
  ) {
    try {
      const updateData: any = { ...updatePromoDto };
      
      // Convert date strings to Date objects if provided
      if (updateData.validFrom) {
        updateData.validFrom = new Date(updateData.validFrom);
      }
      if (updateData.validUntil) {
        updateData.validUntil = new Date(updateData.validUntil);
      }

      const promoCode = await this.promoService.updatePromoCode(id, updateData);
      
      return {
        success: true,
        message: 'Promo code updated successfully',
        data: promoCode,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update promo code',
        error: error.message,
      };
    }
  }

  @Delete(':id')
  async deletePromoCode(@Param('id') id: string) {
    try {
      const result = await this.promoService.deletePromoCode(id);
      
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete promo code',
        error: error.message,
      };
    }
  }

  @Post('validate')
  @Roles(Role.USER, Role.ADMIN) // Users can validate promo codes
  async validatePromoCode(
    @Body() body: { code: string; amount: number },
    @Request() req
  ) {
    try {
      const validation = await this.promoService.validatePromoCode(
        body.code,
        body.amount,
        req.user.id
      );
      
      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to validate promo code',
        error: error.message,
      };
    }
  }
}