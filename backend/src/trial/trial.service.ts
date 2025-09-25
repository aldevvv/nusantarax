import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrialStatus } from '@prisma/client';

@Injectable()
export class TrialService {
  constructor(private prisma: PrismaService) {}

  async getAllTrialConfigurations() {
    const configs = await this.prisma.trialConfiguration.findMany({
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            monthlyPrice: true,
            monthlyRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return configs.map(config => ({
      ...config,
      plan: {
        ...config.plan,
        monthlyPriceFormatted: this.formatCurrency(config.plan.monthlyPrice),
      },
    }));
  }

  async createTrialConfiguration(data: {
    planId: string;
    trialDays: number;
    maxTrialUsers: number;
    validFrom: Date;
    validUntil: Date;
    createdBy: string;
    description?: string;
  }) {
    // Check if trial config already exists for this plan
    const existing = await this.prisma.trialConfiguration.findFirst({
      where: { planId: data.planId },
    });

    if (existing) {
      throw new Error('Trial configuration already exists for this plan');
    }

    const config = await this.prisma.trialConfiguration.create({
      data: {
        ...data,
        isActive: false, // Start as inactive
        currentTrialUsers: 0,
      },
      include: {
        plan: true,
      },
    });

    return config;
  }

  async updateTrialConfiguration(
    id: string,
    data: {
      isActive?: boolean;
      trialDays?: number;
      maxTrialUsers?: number;
      validFrom?: Date;
      validUntil?: Date;
      description?: string;
    }
  ) {
    const config = await this.prisma.trialConfiguration.update({
      where: { id },
      data,
      include: {
        plan: true,
      },
    });

    return config;
  }

  async deleteTrialConfiguration(id: string) {
    // Check if there are active trials using this configuration
    const activeTrials = await this.prisma.trialHistory.count({
      where: {
        trialConfigId: id,
        status: 'ACTIVE',
      },
    });

    if (activeTrials > 0) {
      throw new Error('Cannot delete trial configuration with active trials');
    }

    return await this.prisma.trialConfiguration.delete({
      where: { id },
    });
  }

  async getTrialStatistics(configId?: string) {
    const whereCondition = configId ? { trialConfigId: configId } : {};

    const [
      totalTrials,
      activeTrials,
      expiredTrials,
      convertedTrials,
      trialsByPlan,
      recentTrials,
    ] = await Promise.all([
      // Total trials count
      this.prisma.trialHistory.count({
        where: whereCondition,
      }),

      // Active trials count
      this.prisma.trialHistory.count({
        where: {
          ...whereCondition,
          status: 'ACTIVE',
        },
      }),

      // Expired trials count
      this.prisma.trialHistory.count({
        where: {
          ...whereCondition,
          status: 'EXPIRED',
        },
      }),

      // Converted trials count
      this.prisma.trialHistory.count({
        where: {
          ...whereCondition,
          convertedToPaid: true,
        },
      }),

      // Trials by plan
      this.prisma.trialHistory.groupBy({
        by: ['planId'],
        where: whereCondition,
        _count: {
          id: true,
        },
      }),

      // Recent trials
      this.prisma.trialHistory.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          plan: {
            select: {
              name: true,
              displayName: true,
            },
          },
          trialConfig: {
            select: {
              id: true,
              trialDays: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

    return {
      overview: {
        totalTrials,
        activeTrials,
        expiredTrials,
        convertedTrials,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      trialsByPlan,
      recentTrials,
    };
  }

  async getAvailablePlans() {
    return await this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        // Only include plans that don't have trial configurations yet
        trialConfigs: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        monthlyPrice: true,
        monthlyRequests: true,
      },
      orderBy: {
        monthlyPrice: 'asc',
      },
    });
  }

  async getAllPlansWithTrialStatus() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      include: {
        trialConfigs: {
          select: {
            id: true,
            isActive: true,
            trialDays: true,
            maxTrialUsers: true,
            currentTrialUsers: true,
            validFrom: true,
            validUntil: true,
            description: true,
          },
        },
      },
      orderBy: {
        monthlyPrice: 'asc',
      },
    });

    return plans.map(plan => ({
      ...plan,
      monthlyPriceFormatted: this.formatCurrency(plan.monthlyPrice),
      hasTrialConfig: plan.trialConfigs.length > 0,
      trialConfig: plan.trialConfigs[0] || null,
    }));
  }

  async getTrialHistory(page: number = 1, limit: number = 20, filters?: {
    planId?: string;
    status?: TrialStatus;
    converted?: boolean;
  }) {
    const skip = (page - 1) * limit;
    
    const whereCondition: any = {};
    if (filters?.planId) whereCondition.planId = filters.planId;
    if (filters?.status) whereCondition.status = filters.status;
    if (filters?.converted !== undefined) whereCondition.convertedToPaid = filters.converted;

    const [trials, total] = await Promise.all([
      this.prisma.trialHistory.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              createdAt: true,
            },
          },
          plan: {
            select: {
              name: true,
              displayName: true,
              monthlyPrice: true,
            },
          },
          trialConfig: {
            select: {
              id: true,
              trialDays: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.trialHistory.count({
        where: whereCondition,
      }),
    ]);

    return {
      trials: trials.map(trial => ({
        ...trial,
        plan: {
          ...trial.plan,
          monthlyPriceFormatted: this.formatCurrency(trial.plan.monthlyPrice),
        },
        daysRemaining: this.calculateDaysRemaining(trial.endDate),
        isExpired: new Date() > trial.endDate,
      })),
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

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private calculateDaysRemaining(endDate: Date): number {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
