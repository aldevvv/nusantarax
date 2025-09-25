import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';
import { TopupService } from './topup.service';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

class CreateManualTopupDto {
  @IsNumber()
  @Min(5000)
  amount: number;

  @IsString()
  paymentMethod: string;
}

class UploadProofDto {
  @IsString()
  topupRequestId: string;
}

class ValidatePromoDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(5000)
  amount: number;
}

class ApproveTopupDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

class RejectTopupDto {
  @IsString()
  reason: string;
}

@Controller('topup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopupController {
  constructor(private topupService: TopupService) {}

  // Manual Topup Endpoints
  @Post('manual/request')
  @Roles(Role.USER, Role.ADMIN)
  async createManualTopupRequest(
    @Body() createTopupDto: CreateManualTopupDto,
    @Request() req
  ) {
    try {
      const topupRequest = await this.topupService.createManualTopupRequest(
        req.user.id,
        createTopupDto.amount,
        createTopupDto.paymentMethod
      );

      return {
        success: true,
        message: 'Manual topup request created successfully',
        data: topupRequest,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create topup request',
        error: error.message,
      };
    }
  }

  @Post('manual/upload-proof')
  @Roles(Role.USER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('proof'))
  async uploadProof(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadProofDto: UploadProofDto,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('Proof image is required');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      const updatedRequest = await this.topupService.uploadProofImage(
        uploadProofDto.topupRequestId,
        file,
        req.user.id
      );

      return {
        success: true,
        message: 'Proof uploaded successfully',
        data: updatedRequest,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload proof',
        error: error.message,
      };
    }
  }

  // Automatic Topup Endpoints
  @Post('validate-promo')
  @Roles(Role.USER, Role.ADMIN)
  async validatePromoCode(@Body() validatePromoDto: ValidatePromoDto, @Request() req) {
    try {
      const validation = await this.topupService.validatePromoCode(
        validatePromoDto.code,
        validatePromoDto.amount,
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

  @Post('automatic/calculate')
  @Roles(Role.USER, Role.ADMIN)
  async calculateAutomaticTopup(
    @Body() body: { amount: number; promoCode?: string }
  ) {
    try {
      const calculation = await this.topupService.calculateAutomaticTopupAmount(
        body.amount,
        body.promoCode
      );

      return {
        success: true,
        data: calculation,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to calculate topup amount',
        error: error.message,
      };
    }
  }

  @Post('automatic/process')
  @Roles(Role.USER, Role.ADMIN)
  async processAutomaticTopup(
    @Body() body: { amount: number; promoCode?: string },
    @Request() req
  ) {
    try {
      const result = await this.topupService.processAutomaticTopup(
        req.user.id,
        body.amount,
        body.promoCode
      );

      return {
        success: true,
        message: 'Payment token generated successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process automatic topup',
        error: error.message,
      };
    }
  }

  @Post('webhook/midtrans')
  @Public()
  async handleMidtransWebhook(@Body() notificationData: any) {
    try {
      const result = await this.topupService.handleMidtransWebhook(notificationData);
      
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process webhook',
        error: error.message,
      };
    }
  }

  // User Topup History
  @Get('requests')
  @Roles(Role.USER, Role.ADMIN)
  async getUserTopupRequests(
    @Request() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
  ) {
    try {
      const result = await this.topupService.getUserTopupRequests(
        req.user.id,
        limit,
        offset
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch topup requests',
        error: error.message,
      };
    }
  }

  @Get('requests/:id')
  @Roles(Role.USER, Role.ADMIN)
  async getTopupRequest(@Param('id') id: string, @Request() req) {
    try {
      const topupRequest = await this.topupService.getTopupRequest(id, req.user.id);

      return {
        success: true,
        data: topupRequest,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch topup request',
        error: error.message,
      };
    }
  }

  // Admin Endpoints
  @Get('admin/requests')
  @Roles(Role.ADMIN)
  async getAllTopupRequests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string
  ) {
    try {
      const result = await this.topupService.getAllTopupRequests(
        page,
        limit,
        status as any
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch topup requests',
        error: error.message,
      };
    }
  }

  @Post('admin/requests/:id/approve')
  @Roles(Role.ADMIN)
  async approveTopupRequest(
    @Param('id') requestId: string,
    @Body() approveDto: ApproveTopupDto,
    @Request() req
  ) {
    try {
      const result = await this.topupService.approveTopupRequest(
        requestId,
        req.user.id,
        approveDto.notes
      );

      return {
        success: true,
        message: 'Topup request approved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to approve topup request',
        error: error.message,
      };
    }
  }

  @Post('admin/requests/:id/reject')
  @Roles(Role.ADMIN)
  async rejectTopupRequest(
    @Param('id') requestId: string,
    @Body() rejectDto: RejectTopupDto,
    @Request() req
  ) {
    try {
      const result = await this.topupService.rejectTopupRequest(
        requestId,
        req.user.id,
        rejectDto.reason
      );

      return {
        success: true,
        message: 'Topup request rejected successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reject topup request',
        error: error.message,
      };
    }
  }
}