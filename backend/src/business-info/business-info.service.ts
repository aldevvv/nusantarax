import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessInfoDto } from './dto/create-business-info.dto';
import { UpdateBusinessInfoDto } from './dto/update-business-info.dto';
import { createClient } from '@supabase/supabase-js';
import { BusinessSize } from '@prisma/client';

@Injectable()
export class BusinessInfoService {
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }

  async create(userId: string, createBusinessInfoDto: CreateBusinessInfoDto) {
    try {
      // Check if user already has business info
      const existingBusinessInfo = await this.prisma.businessInfo.findUnique({
        where: { userId },
      });

      if (existingBusinessInfo) {
        throw new BadRequestException('Business information already exists for this user');
      }

      // Create business info
      const businessInfo = await this.prisma.businessInfo.create({
        data: {
          userId,
          businessName: createBusinessInfoDto.businessName,
          description: createBusinessInfoDto.description,
          category: createBusinessInfoDto.category,
          subCategory: createBusinessInfoDto.subCategory,
          brandColors: createBusinessInfoDto.brandColors,
          logoUrl: createBusinessInfoDto.logoUrl,
          industry: createBusinessInfoDto.industry,
          businessModel: createBusinessInfoDto.businessModel,
          targetAudience: createBusinessInfoDto.targetAudience,
          businessSize: (createBusinessInfoDto.businessSize as BusinessSize) || BusinessSize.MICRO,
          establishedYear: createBusinessInfoDto.establishedYear,
          mainProducts: createBusinessInfoDto.mainProducts || [],
          keyServices: createBusinessInfoDto.keyServices || [],
          brandVoice: createBusinessInfoDto.brandVoice,
          brandPersonality: createBusinessInfoDto.brandPersonality || [],
          address: createBusinessInfoDto.address,
          city: createBusinessInfoDto.city,
          region: createBusinessInfoDto.region,
          postalCode: createBusinessInfoDto.postalCode,
          website: createBusinessInfoDto.website,
          phoneNumber: createBusinessInfoDto.phoneNumber,
          socialMedia: createBusinessInfoDto.socialMedia || {},
          businessGoals: createBusinessInfoDto.businessGoals || [],
          marketingFocus: createBusinessInfoDto.marketingFocus || [],
          contentTone: createBusinessInfoDto.contentTone,
          preferredLanguage: createBusinessInfoDto.preferredLanguage || 'id',
          isCompleted: createBusinessInfoDto.isCompleted || false,
          completedAt: createBusinessInfoDto.isCompleted ? new Date() : null,
        },
      });

      return businessInfo;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create business information: ${error.message}`);
    }
  }

  async findByUserId(userId: string) {
    try {
      const businessInfo = await this.prisma.businessInfo.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      return businessInfo;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch business information: ${error.message}`);
    }
  }

  async update(userId: string, updateBusinessInfoDto: UpdateBusinessInfoDto) {
    try {
      // Check if business info exists
      const existingBusinessInfo = await this.prisma.businessInfo.findUnique({
        where: { userId },
      });

      if (!existingBusinessInfo) {
        throw new NotFoundException('Business information not found');
      }

      // Prepare update data
      const updateData: any = {};
      
      Object.keys(updateBusinessInfoDto).forEach(key => {
        if (updateBusinessInfoDto[key] !== undefined) {
          updateData[key] = updateBusinessInfoDto[key];
        }
      });

      // Handle completion logic
      if (updateBusinessInfoDto.isCompleted === true && !existingBusinessInfo.isCompleted) {
        updateData.completedAt = new Date();
      } else if (updateBusinessInfoDto.isCompleted === false) {
        updateData.completedAt = null;
      }

      const businessInfo = await this.prisma.businessInfo.update({
        where: { userId },
        data: updateData,
      });

      return businessInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update business information: ${error.message}`);
    }
  }

  async delete(userId: string) {
    try {
      // Check if business info exists
      const existingBusinessInfo = await this.prisma.businessInfo.findUnique({
        where: { userId },
      });

      if (!existingBusinessInfo) {
        throw new NotFoundException('Business information not found');
      }

      await this.prisma.businessInfo.delete({
        where: { userId },
      });

      return { message: 'Business information deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete business information: ${error.message}`);
    }
  }

  async getBusinessCategories() {
    return [
      'Food & Beverage',
      'Fashion & Apparel',
      'Technology & Software',
      'Health & Beauty',
      'Education & Training',
      'Retail & E-commerce',
      'Services & Consulting',
      'Manufacturing',
      'Agriculture & Farming',
      'Tourism & Hospitality',
      'Arts & Crafts',
      'Automotive',
      'Construction & Real Estate',
      'Finance & Insurance',
      'Media & Entertainment',
      'Sports & Recreation',
      'Home & Garden',
      'Other'
    ];
  }

  async getIndustryOptions() {
    return [
      'Agriculture',
      'Automotive',
      'Banking & Finance',
      'Construction',
      'Education',
      'Energy',
      'Entertainment',
      'Fashion',
      'Food & Beverage',
      'Healthcare',
      'Manufacturing',
      'Real Estate',
      'Retail',
      'Services',
      'Technology',
      'Tourism',
      'Transportation',
      'Other'
    ];
  }

  async getBrandVoiceOptions() {
    return [
      'Professional',
      'Casual',
      'Friendly',
      'Authoritative',
      'Humorous',
      'Educational',
      'Inspirational',
      'Trustworthy'
    ];
  }

  async getContentToneOptions() {
    return [
      'Professional',
      'Casual',
      'Humorous',
      'Educational',
      'Inspirational',
      'Authoritative',
      'Friendly',
      'Persuasive'
    ];
  }

  async getBrandPersonalityOptions() {
    return [
      'Innovative',
      'Trustworthy',
      'Creative',
      'Reliable',
      'Modern',
      'Traditional',
      'Bold',
      'Elegant',
      'Fun',
      'Sophisticated',
      'Caring',
      'Dynamic'
    ];
  }

  async uploadLogo(userId: string, file: Express.Multer.File): Promise<string> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate unique filename
      const fileExtension = file.mimetype.split('/')[1];
      const fileName = `business-logo-${userId}-${Date.now()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('business-logo')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new BadRequestException(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrl } = this.supabase.storage
        .from('business-logo')
        .getPublicUrl(fileName);

      // Update business info with new logo URL if exists, or store for later use
      const existingBusinessInfo = await this.prisma.businessInfo.findUnique({
        where: { userId },
      });

      if (existingBusinessInfo) {
        await this.prisma.businessInfo.update({
          where: { userId },
          data: { logoUrl: publicUrl.publicUrl },
        });
      }

      return publicUrl.publicUrl;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload logo: ${error.message}`);
    }
  }
}