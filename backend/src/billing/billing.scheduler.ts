import { Injectable, Logger } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class BillingScheduler {
  private readonly logger = new Logger(BillingScheduler.name);

  constructor(
    private billingService: BillingService,
    private prisma: PrismaService
  ) {
    // Start background interval for auto-renewals (every 6 hours)
    this.startAutoRenewInterval();
    // Start background interval for expiry checks (every 12 hours)
    this.startExpiryInterval();
  }

  private startAutoRenewInterval() {
    setInterval(async () => {
      try {
        await this.handleAutoRenewals();
      } catch (error) {
        this.logger.error('Auto-renewal interval error:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  private startExpiryInterval() {
    setInterval(async () => {
      try {
        await this.handleExpiredSubscriptions();
      } catch (error) {
        this.logger.error('Expiry check interval error:', error);
      }
    }, 12 * 60 * 60 * 1000); // 12 hours
  }

  // Process auto-renewals
  async handleAutoRenewals() {
    this.logger.log('Starting auto-renewal process...');

    try {
      // Find subscriptions that are due for renewal (within next 24 hours)
      const now = new Date();
      const renewalWindow = new Date();
      renewalWindow.setHours(renewalWindow.getHours() + 24);

      const subscriptionsDue = await this.prisma.userSubscription.findMany({
        where: {
          autoRenew: true,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: {
            lte: renewalWindow,
            gte: now,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          plan: true,
        },
      });

      this.logger.log(`Found ${subscriptionsDue.length} subscriptions due for renewal`);

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process each subscription
      for (const subscription of subscriptionsDue) {
        try {
          const result = await this.billingService.processAutoRenew(subscription.userId);
          
          if (result.success) {
            results.successful++;
            this.logger.log(`Auto-renewal successful for user ${subscription.user.email}`);
          } else {
            results.failed++;
            results.errors.push(`${subscription.user.email}: ${result.message}`);
            this.logger.warn(`Auto-renewal failed for user ${subscription.user.email}: ${result.message}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`${subscription.user.email}: ${error.message}`);
          this.logger.error(`Auto-renewal error for user ${subscription.user.email}:`, error);
        }
      }

      this.logger.log(`Auto-renewal process completed. Successful: ${results.successful}, Failed: ${results.failed}`);
      
      if (results.errors.length > 0) {
        this.logger.warn('Auto-renewal errors:', results.errors);
      }

    } catch (error) {
      this.logger.error('Auto-renewal process failed:', error);
    }
  }

  // Process expired subscriptions
  async handleExpiredSubscriptions() {
    this.logger.log('Starting subscription expiry process...');

    try {
      const now = new Date();

      // Find expired subscriptions that are still active
      const expiredSubscriptions = await this.prisma.userSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: {
            lt: now,
          },
          OR: [
            { autoRenew: false },
            { cancelAtPeriodEnd: true },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          plan: true,
        },
      });

      this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

      // Mark as expired
      if (expiredSubscriptions.length > 0) {
        await this.prisma.userSubscription.updateMany({
          where: {
            id: {
              in: expiredSubscriptions.map(sub => sub.id),
            },
          },
          data: {
            status: SubscriptionStatus.EXPIRED,
          },
        });

        this.logger.log(`Marked ${expiredSubscriptions.length} subscriptions as expired`);
      }

    } catch (error) {
      this.logger.error('Subscription expiry process failed:', error);
    }
  }

  // Manual trigger for testing (remove in production)
  async testAutoRenew(userId: string) {
    this.logger.log(`Testing auto-renewal for user: ${userId}`);
    return await this.billingService.processAutoRenew(userId);
  }
}