import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessInfoService } from './business-info.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/auth.types';
import { CreateBusinessInfoDto } from './dto/create-business-info.dto';
import { UpdateBusinessInfoDto } from './dto/update-business-info.dto';

@Controller('business-info')
@UseGuards(JwtAuthGuard)
export class BusinessInfoController {
  constructor(private businessInfoService: BusinessInfoService) {}

  @Get()
  async getBusinessInfo(@CurrentUser() user: AuthenticatedUser) {
    try {
      const businessInfo = await this.businessInfoService.findByUserId(user.id);
      
      return {
        success: true,
        data: businessInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch business information',
      };
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBusinessInfo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createBusinessInfoDto: CreateBusinessInfoDto,
  ) {
    try {
      const businessInfo = await this.businessInfoService.create(
        user.id,
        createBusinessInfoDto,
      );

      return {
        success: true,
        message: 'Business information created successfully',
        data: businessInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create business information',
      };
    }
  }

  @Put()
  async updateBusinessInfo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateBusinessInfoDto: UpdateBusinessInfoDto,
  ) {
    try {
      const businessInfo = await this.businessInfoService.update(
        user.id,
        updateBusinessInfoDto,
      );

      return {
        success: true,
        message: 'Business information updated successfully',
        data: businessInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update business information',
      };
    }
  }

  @Delete()
  async deleteBusinessInfo(@CurrentUser() user: AuthenticatedUser) {
    try {
      const result = await this.businessInfoService.delete(user.id);

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete business information',
      };
    }
  }

  @Get('categories')
  async getBusinessCategories() {
    try {
      const categories = await this.businessInfoService.getBusinessCategories();

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch business categories',
      };
    }
  }

  @Get('industries')
  async getIndustryOptions() {
    try {
      const industries = await this.businessInfoService.getIndustryOptions();

      return {
        success: true,
        data: industries,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch industry options',
      };
    }
  }

  @Get('brand-voices')
  async getBrandVoiceOptions() {
    try {
      const brandVoices = await this.businessInfoService.getBrandVoiceOptions();

      return {
        success: true,
        data: brandVoices,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch brand voice options',
      };
    }
  }

  @Get('content-tones')
  async getContentToneOptions() {
    try {
      const contentTones = await this.businessInfoService.getContentToneOptions();

      return {
        success: true,
        data: contentTones,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch content tone options',
      };
    }
  }

  @Get('brand-personalities')
  async getBrandPersonalityOptions() {
    try {
      const personalities = await this.businessInfoService.getBrandPersonalityOptions();

      return {
        success: true,
        data: personalities,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch brand personality options',
      };
    }
  }
}