import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminPlansService {
  constructor(private prisma: PrismaService) {}

  async getAllPlansWithStats() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return plans;
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            billingCycle: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async updatePlan(
    id: string, 
    updateData: {
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
    // Check if plan exists
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Update the plan
    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    return updatedPlan;
  }

  async getPlanUsageStats(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Get subscription statistics
    const subscriptionStats = await this.prisma.userSubscription.groupBy({
      by: ['status', 'billingCycle'],
      where: { planId: id },
      _count: {
        id: true
      }
    });

    // Get revenue for this plan from PaymentHistory
    const monthlyRevenue = await this.prisma.paymentHistory.aggregate({
      where: {
        planId: id,
        status: 'COMPLETED',
        type: 'SUBSCRIPTION'
      },
      _sum: {
        amount: true
      }
    });

    const yearlyRevenue = await this.prisma.paymentHistory.aggregate({
      where: {
        planId: id,
        status: 'COMPLETED',
        type: 'SUBSCRIPTION'
      },
      _sum: {
        amount: true
      }
    });

    // Get recent subscriptions
    const recentSubscriptions = await this.prisma.userSubscription.findMany({
      where: { planId: id },
      select: {
        id: true,
        status: true,
        billingCycle: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate growth rate (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentSubscriptionsCount = await this.prisma.userSubscription.count({
      where: {
        planId: id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const previousSubscriptionsCount = await this.prisma.userSubscription.count({
      where: {
        planId: id,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    });

    const growthRate = previousSubscriptionsCount === 0 ? 100 : 
      ((recentSubscriptionsCount - previousSubscriptionsCount) / previousSubscriptionsCount) * 100;

    return {
      plan,
      subscriptionStats,
      revenue: {
        monthly: monthlyRevenue._sum?.amount || 0,
        yearly: yearlyRevenue._sum?.amount || 0,
        total: (monthlyRevenue._sum?.amount || 0) + (yearlyRevenue._sum?.amount || 0)
      },
      recentSubscriptions,
      growth: {
        thirtyDaysCount: recentSubscriptionsCount,
        previousPeriodCount: previousSubscriptionsCount,
        growthRate: Math.round(growthRate * 100) / 100
      }
    };
  }

  async getPlansComparison() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    });

    // Calculate total revenue for each plan
    const plansWithRevenue = await Promise.all(
      plans.map(async (plan) => {
        const revenue = await this.prisma.paymentHistory.aggregate({
          where: {
            planId: plan.id,
            status: 'COMPLETED',
            type: 'SUBSCRIPTION'
          },
          _sum: {
            amount: true
          }
        });

        return {
          ...plan,
          totalRevenue: revenue._sum?.amount || 0
        };
      })
    );

    return plansWithRevenue;
  }

  async getSubscriptionCounts() {
    const counts = await this.prisma.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        _count: {
          select: {
            subscriptions: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Get total counts by status
    const statusCounts = await this.prisma.userSubscription.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get billing cycle distribution
    const billingCycleCounts = await this.prisma.userSubscription.groupBy({
      by: ['billingCycle'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        id: true
      }
    });

    return {
      planCounts: counts,
      statusDistribution: statusCounts,
      billingCycleDistribution: billingCycleCounts
    };
  }
}