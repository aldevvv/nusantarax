import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType } from '@prisma/client';

interface CreatePromoCodeDto {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsage: number;
  maxUsagePerUser: number;
  maxTotalUsers: number;
  applicableFor: 'TOPUP' | 'PLAN' | 'BOTH';
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  minAmount: number;
  maxDiscount?: number;
}

interface UpdatePromoCodeDto {
  name?: string;
  description?: string;
  discountValue?: number;
  maxUsage?: number;
  maxUsagePerUser?: number;
  maxTotalUsers?: number;
  applicableFor?: 'TOPUP' | 'PLAN' | 'BOTH';
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date;
  minAmount?: number;
  maxDiscount?: number;
}

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async createPromoCode(data: CreatePromoCodeDto, adminId: string) {
    // Check if code already exists
    const existingPromo = await this.prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingPromo) {
      throw new ConflictException('Promo code already exists');
    }

    // Validate dates
    if (new Date(data.validFrom) >= new Date(data.validUntil)) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    // Validate discount value
    if (data.discountType === 'PERCENTAGE' && (data.discountValue <= 0 || data.discountValue > 100)) {
      throw new BadRequestException('Percentage discount must be between 1 and 100');
    }

    if (data.discountType === 'FIXED' && data.discountValue <= 0) {
      throw new BadRequestException('Fixed discount must be greater than 0');
    }

    const promoCode = await this.prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUsage: data.maxUsage,
        maxUsagePerUser: data.maxUsagePerUser,
        isActive: data.isActive,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        minAmount: data.minAmount,
        maxDiscount: data.maxDiscount,
        createdBy: adminId,
      },
    });

    return promoCode;
  }

  async getAllPromoCodes(page: number = 1, limit: number = 20, isActiveOnly: boolean = false) {
    const skip = (page - 1) * limit;
    const whereCondition = isActiveOnly ? { isActive: true } : {};

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where: whereCondition,
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip,
        include: {
          topupTransactions: {
            select: {
              discountAmount: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.promoCode.count({
        where: whereCondition,
      }),
    ]);

    const promoCodesWithStats = promoCodes.map(promo => ({
      ...promo,
      totalDiscountGiven: promo.topupTransactions.reduce(
        (sum, usage) => sum + usage.discountAmount,
        0
      ),
      totalDiscountGivenFormatted: this.formatCurrency(
        promo.topupTransactions.reduce((sum, usage) => sum + usage.discountAmount, 0)
      ),
    }));

    return {
      promoCodes: promoCodesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getPromoCodeById(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        topupTransactions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
            paymentHistory: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  async updatePromoCode(id: string, data: UpdatePromoCodeDto) {
    const existingPromo = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromo) {
      throw new NotFoundException('Promo code not found');
    }

    // Validate dates if provided
    const validFrom = data.validFrom || existingPromo.validFrom;
    const validUntil = data.validUntil || existingPromo.validUntil;

    if (new Date(validFrom) >= new Date(validUntil)) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    // Validate discount value if provided
    if (data.discountValue !== undefined) {
      if (existingPromo.discountType === 'PERCENTAGE' && (data.discountValue <= 0 || data.discountValue > 100)) {
        throw new BadRequestException('Percentage discount must be between 1 and 100');
      }

      if (existingPromo.discountType === 'FIXED' && data.discountValue <= 0) {
        throw new BadRequestException('Fixed discount must be greater than 0');
      }
    }

    const updatedPromo = await this.prisma.promoCode.update({
      where: { id },
      data: {
        ...data,
        validFrom,
        validUntil,
      },
    });

    return updatedPromo;
  }

  async deletePromoCode(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        topupTransactions: true,
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    // Check if promo code has been used
    if (promoCode.currentUsage > 0) {
      throw new BadRequestException('Cannot delete promo code that has been used. Consider deactivating it instead.');
    }

    await this.prisma.promoCode.delete({
      where: { id },
    });

    return { message: 'Promo code deleted successfully' };
  }

  async validatePromoCode(code: string, amount: number, userId: string) {
    const promoCode = await this.prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });

    if (!promoCode) {
      return {
        isValid: false,
        errorMessage: 'Invalid or expired promo code',
      };
    }

    // Check minimum amount
    if (amount < promoCode.minAmount) {
      return {
        isValid: false,
        errorMessage: `Minimum amount is ${this.formatCurrency(promoCode.minAmount)}`,
      };
    }

    // Check total usage limit
    if (promoCode.maxUsage > 0 && promoCode.currentUsage >= promoCode.maxUsage) {
      return {
        isValid: false,
        errorMessage: 'Promo code usage limit exceeded',
      };
    }

    // Check user usage limit
    const userUsageCount = await this.prisma.topupPromoUsage.count({
      where: {
        userId,
        promoCodeId: promoCode.id,
      },
    });

    if (userUsageCount >= promoCode.maxUsagePerUser) {
      return {
        isValid: false,
        errorMessage: 'You have already used this promo code',
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (amount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    return {
      isValid: true,
      promoCode,
      discountAmount,
      discountAmountFormatted: this.formatCurrency(discountAmount),
    };
  }

  async applyPromoCode(
    userId: string,
    promoCodeId: string,
    paymentHistoryId: string,
    discountAmount: number
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Create usage record
      const promoUsage = await tx.topupPromoUsage.create({
        data: {
          userId,
          promoCodeId,
          paymentHistoryId,
          discountAmount,
        },
      });

      // Increment usage count
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: {
          currentUsage: { increment: 1 },
        },
      });

      return promoUsage;
    });
  }

  async getPromoCodeStats(id: string) {
    const promoCode = await this.getPromoCodeById(id);
    
    const stats = {
      totalUsage: promoCode.currentUsage,
      totalDiscountGiven: promoCode.topupTransactions.reduce(
        (sum, usage) => sum + usage.discountAmount,
        0
      ),
      uniqueUsers: new Set(promoCode.topupTransactions.map(t => t.userId)).size,
      averageDiscountPerUsage: promoCode.currentUsage > 0 
        ? promoCode.topupTransactions.reduce((sum, usage) => sum + usage.discountAmount, 0) / promoCode.currentUsage
        : 0,
      usageByDay: this.groupUsageByDay(promoCode.topupTransactions),
    };

    return {
      ...promoCode,
      stats: {
        ...stats,
        totalDiscountGivenFormatted: this.formatCurrency(stats.totalDiscountGiven),
        averageDiscountPerUsageFormatted: this.formatCurrency(stats.averageDiscountPerUsage),
      },
    };
  }

  private groupUsageByDay(transactions: any[]) {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}