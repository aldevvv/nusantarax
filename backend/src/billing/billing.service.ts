import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentType, PaymentStatus, PeriodType, BillingCycle, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getBillingHistory(userId: string, limit: number = 50, offset: number = 0) {
    const payments = await this.prisma.paymentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        plan: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    });

    const total = await this.prisma.paymentHistory.count({
      where: { userId },
    });

    return {
      payments: payments.map(payment => ({
        ...payment,
        amountFormatted: this.formatCurrency(payment.amount),
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  async getUsageStats(userId: string, timeframe: 'month' | 'week' | 'today' = 'month') {
    const dateFilter = this.getDateFilter(timeframe);
    
    // Get API usage statistics
    const apiStats = await this.prisma.apiCallLog.aggregate({
      where: {
        userId,
        ...dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
        inputTokens: true,
        outputTokens: true,
      },
    });

    // Get usage by model
    const modelUsage = await this.prisma.apiCallLog.groupBy({
      by: ['modelUsed'],
      where: {
        userId,
        modelUsed: { not: null },
        ...dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get usage by endpoint
    const endpointUsage = await this.prisma.apiCallLog.groupBy({
      by: ['endpoint'],
      where: {
        userId,
        ...dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get daily usage for the period
    const dailyUsage = await this.prisma.apiCallLog.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        ...dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Process daily usage into chart data
    const dailyUsageChart = this.processDailyUsage(dailyUsage, timeframe);

    return {
      overview: {
        totalRequests: apiStats._count.id || 0,
        totalTokens: apiStats._sum.totalTokens || 0,
        inputTokens: apiStats._sum.inputTokens || 0,
        outputTokens: apiStats._sum.outputTokens || 0,
        timeframe,
      },
      modelUsage: modelUsage.map(model => ({
        model: model.modelUsed,
        requests: model._count.id,
        tokens: model._sum.totalTokens || 0,
      })),
      endpointUsage: endpointUsage.map(endpoint => ({
        endpoint: endpoint.endpoint,
        requests: endpoint._count.id,
        tokens: endpoint._sum.totalTokens || 0,
      })),
      dailyUsage: dailyUsageChart,
    };
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            monthlyRequests: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    // 🔧 FIX: Get actual usage from apiCallLog during current period
    const actualUsage = await this.getActualRequestUsage(userId, subscription);
    
    // 🔧 FIX: Sync the requestsUsed with actual usage to prevent negative values
    if (actualUsage !== subscription.requestsUsed) {
      console.log(`🔄 Syncing usage for user ${userId}: DB=${subscription.requestsUsed} -> Actual=${actualUsage}`);
      
      await this.prisma.userSubscription.update({
        where: { userId },
        data: { requestsUsed: actualUsage }
      });
      
      subscription.requestsUsed = actualUsage;
    }

    const usagePercentage = subscription.requestsLimit > 0
      ? Math.round((actualUsage / subscription.requestsLimit) * 100)
      : 0;

    const requestsRemaining = subscription.requestsLimit === -1
      ? -1 // Unlimited
      : Math.max(0, subscription.requestsLimit - actualUsage);

    return {
      ...subscription,
      requestsUsed: actualUsage,
      plan: {
        ...subscription.plan,
        monthlyPriceFormatted: this.formatCurrency(subscription.plan.monthlyPrice),
        yearlyPriceFormatted: this.formatCurrency(subscription.plan.yearlyPrice),
      },
      usagePercentage,
      requestsRemaining,
    };
  }

  /**
   * 🔧 NEW: Get actual request usage from apiCallLog during current subscription period
   */
  private async getActualRequestUsage(userId: string, subscription: any): Promise<number> {
    const actualUsage = await this.prisma.apiCallLog.count({
      where: {
        userId,
        createdAt: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd,
        },
        status: 'SUCCESS', // Only count successful requests
      },
    });

    return actualUsage;
  }

  async getRecentErrors(userId: string, limit: number = 10) {
    const errors = await this.prisma.apiCallLog.findMany({
      where: {
        userId,
        status: {
          in: ['FAILED', 'TIMEOUT', 'RATE_LIMITED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        endpoint: true,
        modelUsed: true,
        status: true,
        errorMessage: true,
        errorCode: true,
        createdAt: true,
      },
    });

    return errors;
  }

  async getBillingOverview(userId: string) {
    const [currentSubscription, recentPayments, totalSpent] = await Promise.all([
      this.getCurrentSubscription(userId),
      this.getBillingHistory(userId, 5),
      this.prisma.paymentHistory.aggregate({
        where: {
          userId,
          status: PaymentStatus.COMPLETED,
          type: {
            in: [PaymentType.SUBSCRIPTION, PaymentType.DEDUCTION], // Only debit transactions
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const nextBillingDate = currentSubscription?.currentPeriodEnd;
    const totalSpentFormatted = this.formatCurrency(totalSpent._sum.amount || 0);

    return {
      currentSubscription,
      nextBillingDate,
      totalSpent: totalSpent._sum.amount || 0,
      totalSpentFormatted,
      recentPayments: recentPayments.payments,
    };
  }

  // Plan Management Methods
  async getAllPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map(plan => ({
      ...plan,
      monthlyPriceFormatted: this.formatCurrency(plan.monthlyPrice),
      yearlyPriceFormatted: this.formatCurrency(plan.yearlyPrice),
    }));
  }

  async upgradePlan(
    userId: string,
    newPlanId: string,
    billingCycle: BillingCycle = 'MONTHLY'
  ) {
    // Validate upgrade request first
    const validation = await this.validateUpgradeRequest(userId, newPlanId, billingCycle);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errorMessage);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Get user wallet
      const wallet = await tx.userWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new BadRequestException('User wallet not found');
      }

      // Get target plan
      const newPlan = await tx.subscriptionPlan.findUnique({
        where: { id: newPlanId, isActive: true },
      });

      if (!newPlan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Calculate amount based on billing cycle
      const amount = billingCycle === 'YEARLY' ? newPlan.yearlyPrice : newPlan.monthlyPrice;

      // Check wallet balance
      if (wallet.balance < amount) {
        throw new BadRequestException(
          `Insufficient wallet balance. Required: ${this.formatCurrency(amount)}, Available: ${this.formatCurrency(wallet.balance)}`
        );
      }

      // Get current subscription if exists
      const currentSubscription = await tx.userSubscription.findUnique({
        where: { userId },
        include: { plan: true },
      });

      // Calculate period dates
      const now = new Date();
      const periodStart = now;
      const periodEnd = new Date(now);
      
      if (billingCycle === 'YEARLY') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Deduct from wallet
      await tx.userWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalSpent: { increment: amount },
        },
      });

      // Create payment history
      const paymentHistory = await tx.paymentHistory.create({
        data: {
          userId,
          type: PaymentType.SUBSCRIPTION,
          amount,
          description: `Subscription Upgrade to ${newPlan.displayName} (${billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'})`,
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'wallet_balance',
          planId: newPlanId,
        },
      });

      // Update or create subscription
      const subscription = await tx.userSubscription.upsert({
        where: { userId },
        update: {
          planId: newPlanId,
          billingCycle,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          requestsUsed: 0, // 🔧 FIX: Reset usage for new period - this is correct for plan upgrades
          requestsLimit: newPlan.monthlyRequests,
          autoRenew: true,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
        create: {
          userId,
          planId: newPlanId,
          billingCycle,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          requestsUsed: 0, // 🔧 FIX: Start fresh with new subscription
          requestsLimit: newPlan.monthlyRequests,
          autoRenew: true,
          cancelAtPeriodEnd: false,
        },
        include: {
          plan: true,
        },
      });

      return {
        subscription,
        paymentHistory,
        deductedAmount: amount,
        remainingBalance: wallet.balance - amount,
      };
    });
  }

  // Plan validation and business rules
  async validateUpgradeRequest(userId: string, newPlanId: string, billingCycle: BillingCycle) {
    const [currentSubscription, newPlan, wallet] = await Promise.all([
      this.prisma.userSubscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      this.prisma.subscriptionPlan.findUnique({
        where: { id: newPlanId, isActive: true },
      }),
      this.prisma.userWallet.findUnique({
        where: { userId },
      }),
    ]);

    // Check if new plan exists and is active
    if (!newPlan) {
      return {
        isValid: false,
        errorMessage: 'Selected plan is not available',
      };
    }

    // Check if user already has this exact plan and billing cycle
    if (currentSubscription &&
        currentSubscription.planId === newPlanId &&
        currentSubscription.billingCycle === billingCycle) {
      return {
        isValid: false,
        errorMessage: 'You are already subscribed to this plan',
      };
    }

    // Check wallet balance
    if (!wallet) {
      return {
        isValid: false,
        errorMessage: 'Wallet not found',
      };
    }

    const amount = billingCycle === 'YEARLY' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
    if (wallet.balance < amount) {
      return {
        isValid: false,
        errorMessage: `Insufficient wallet balance. Required: ${this.formatCurrency(amount)}, Available: ${this.formatCurrency(wallet.balance)}`,
      };
    }

    // Business rules: prevent downgrade during active period
    if (currentSubscription && currentSubscription.plan) {
      const currentPlanPrice = currentSubscription.billingCycle === 'YEARLY'
        ? currentSubscription.plan.yearlyPrice
        : currentSubscription.plan.monthlyPrice;
      
      const newPlanPrice = billingCycle === 'YEARLY' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
      
      // Allow same price changes (e.g., monthly to yearly of same tier)
      if (newPlanPrice < currentPlanPrice) {
        // Check if current period has significant time left (more than 7 days)
        const now = new Date();
        const daysLeft = Math.ceil((currentSubscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 7) {
          return {
            isValid: false,
            errorMessage: `Cannot downgrade with ${daysLeft} days remaining in current period. Please wait until renewal or contact support.`,
          };
        }
      }
    }

    return {
      isValid: true,
      errorMessage: null,
    };
  }

  async canUserAffordPlan(userId: string, planId: string, billingCycle: BillingCycle) {
    const [wallet, plan] = await Promise.all([
      this.prisma.userWallet.findUnique({ where: { userId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { id: planId } }),
    ]);

    if (!wallet || !plan) {
      return false;
    }

    const amount = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
    return wallet.balance >= amount;
  }

  async getPlanHierarchy() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map((plan, index) => ({
      ...plan,
      tier: index, // 0 = lowest tier, higher number = higher tier
      monthlyPriceFormatted: this.formatCurrency(plan.monthlyPrice),
      yearlyPriceFormatted: this.formatCurrency(plan.yearlyPrice),
    }));
  }

  async toggleAutoRenew(userId: string, enabled: boolean) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updatedSubscription = await this.prisma.userSubscription.update({
      where: { userId },
      data: {
        autoRenew: enabled,
        cancelAtPeriodEnd: !enabled, // If auto-renew disabled, cancel at period end
      },
      include: { plan: true },
    });

    return updatedSubscription;
  }

  async processAutoRenew(userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.findUnique({
        where: { userId },
        include: { plan: true },
      });

      if (!subscription || !subscription.autoRenew || subscription.status !== SubscriptionStatus.ACTIVE) {
        return { success: false, message: 'Auto-renew not applicable' };
      }

      // Check if subscription is due for renewal (within 24 hours)
      const now = new Date();
      const renewalWindow = new Date(subscription.currentPeriodEnd);
      renewalWindow.setHours(renewalWindow.getHours() - 24);

      if (now < renewalWindow) {
        return { success: false, message: 'Not yet due for renewal' };
      }

      // Get user wallet
      const wallet = await tx.userWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new BadRequestException('User wallet not found');
      }

      // Calculate renewal amount
      const amount = subscription.billingCycle === 'YEARLY'
        ? subscription.plan.yearlyPrice
        : subscription.plan.monthlyPrice;

      // Check wallet balance
      if (wallet.balance < amount) {
        // Disable auto-renew and mark for cancellation
        await tx.userSubscription.update({
          where: { userId },
          data: {
            autoRenew: false,
            cancelAtPeriodEnd: true,
            status: SubscriptionStatus.SUSPENDED,
          },
        });

        return {
          success: false,
          message: 'Insufficient wallet balance for auto-renewal',
          action: 'disabled_auto_renew'
        };
      }

      // Process renewal payment
      await tx.userWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalSpent: { increment: amount },
        },
      });

      // Create payment history
      await tx.paymentHistory.create({
        data: {
          userId,
          type: PaymentType.SUBSCRIPTION,
          amount,
          description: `Subscription Auto-Renewal - ${subscription.plan.displayName} (${subscription.billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'})`,
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'wallet_balance_auto',
          planId: subscription.planId,
        },
      });

      // Extend subscription period
      const newPeriodStart = subscription.currentPeriodEnd;
      const newPeriodEnd = new Date(newPeriodStart);
      
      if (subscription.billingCycle === 'YEARLY') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      } else {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      }

      await tx.userSubscription.update({
        where: { userId },
        data: {
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          requestsUsed: 0, // 🔧 FIX: Reset usage for new period - this is correct for renewals
          status: SubscriptionStatus.ACTIVE,
        },
      });

      return {
        success: true,
        message: 'Auto-renewal completed successfully',
        renewedUntil: newPeriodEnd,
        chargedAmount: amount
      };
    });
  }

  async cancelSubscription(userId: string, immediately: boolean = false) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (immediately) {
      // Cancel immediately
      const updatedSubscription = await this.prisma.userSubscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.CANCELED,
          autoRenew: false,
          canceledAt: new Date(),
        },
        include: { plan: true },
      });

      return {
        ...updatedSubscription,
        message: 'Subscription cancelled immediately'
      };
    } else {
      // Cancel at period end
      const updatedSubscription = await this.prisma.userSubscription.update({
        where: { userId },
        data: {
          autoRenew: false,
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
        },
        include: { plan: true },
      });

      return {
        ...updatedSubscription,
        message: `Subscription will be cancelled on ${subscription.currentPeriodEnd.toLocaleDateString()}`
      };
    }
  }

  // Utility methods
  async getSubscriptionPrice(planId: string, billingCycle: BillingCycle) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
  }

  async getUpgradePreview(userId: string, newPlanId: string, billingCycle: BillingCycle) {
    const [currentSubscription, newPlan, wallet] = await Promise.all([
      this.prisma.userSubscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      this.prisma.subscriptionPlan.findUnique({
        where: { id: newPlanId },
      }),
      this.prisma.userWallet.findUnique({
        where: { userId },
      }),
    ]);

    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const amount = billingCycle === 'YEARLY' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
    const canAfford = wallet.balance >= amount;

    return {
      currentPlan: currentSubscription?.plan || null,
      newPlan: {
        ...newPlan,
        monthlyPriceFormatted: this.formatCurrency(newPlan.monthlyPrice),
        yearlyPriceFormatted: this.formatCurrency(newPlan.yearlyPrice),
      },
      pricing: {
        amount,
        amountFormatted: this.formatCurrency(amount),
        billingCycle,
      },
      wallet: {
        currentBalance: wallet.balance,
        currentBalanceFormatted: this.formatCurrency(wallet.balance),
        remainingAfterUpgrade: wallet.balance - amount,
        remainingAfterUpgradeFormatted: this.formatCurrency(wallet.balance - amount),
        canAfford,
      },
    };
  }

  private getDateFilter(timeframe: 'month' | 'week' | 'today') {
    const now = new Date();
    
    switch (timeframe) {
      case 'today':
        return {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        };
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          createdAt: {
            gte: weekAgo,
          },
        };
      case 'month':
      default:
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return {
          createdAt: {
            gte: monthAgo,
          },
        };
    }
  }

  private processDailyUsage(dailyUsage: any[], timeframe: string) {
    // Group by date and sum the usage
    const usageMap = new Map();
    
    dailyUsage.forEach(usage => {
      const date = new Date(usage.createdAt).toISOString().split('T')[0];
      const existing = usageMap.get(date) || { date, requests: 0, tokens: 0 };
      
      usageMap.set(date, {
        date,
        requests: existing.requests + usage._count.id,
        tokens: existing.tokens + (usage._sum.totalTokens || 0),
      });
    });

    return Array.from(usageMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
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
