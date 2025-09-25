import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../lib/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  // Health check method to test database connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Delegate all Prisma methods to the singleton instance
  get user() { return this.prisma.user; }
  get userProvider() { return this.prisma.userProvider; }
  get userApiUsage() { return this.prisma.userApiUsage; }
  get subscriptionPlan() { return this.prisma.subscriptionPlan; }
  get userSubscription() { return this.prisma.userSubscription; }
  get userWallet() { return this.prisma.userWallet; }
  get paymentHistory() { return this.prisma.paymentHistory; }
  get trialConfiguration() { return this.prisma.trialConfiguration; }
  get trialHistory() { return this.prisma.trialHistory; }
  get apiCallLog() { return this.prisma.apiCallLog; }
  get topupRequest() { return this.prisma.topupRequest; }
  get promoCode() { return this.prisma.promoCode; }
  get topupPromoUsage() { return this.prisma.topupPromoUsage; }
  get businessInfo() { return this.prisma.businessInfo; }
  
  // Image Generator models
  get imageTemplate() { return this.prisma.imageTemplate; }
  get imageGenerationRequest() { return this.prisma.imageGenerationRequest; }
  get imageGenerationResult() { return this.prisma.imageGenerationResult; }

  // Caption Generator models
  get captionGenerationRequest() { return this.prisma.captionGenerationRequest; }
  get captionGenerationResult() { return this.prisma.captionGenerationResult; }

  // AI Assistant models
  get aiAssistantSession() { return this.prisma.aiAssistantSession; }
  get aiAssistantMessage() { return this.prisma.aiAssistantMessage; }

  // Delegate transaction and other methods
  get $transaction() { return this.prisma.$transaction.bind(this.prisma); }
  get $connect() { return this.prisma.$connect.bind(this.prisma); }
  get $disconnect() { return this.prisma.$disconnect.bind(this.prisma); }
  get $executeRaw() { return this.prisma.$executeRaw.bind(this.prisma); }
  get $executeRawUnsafe() { return this.prisma.$executeRawUnsafe.bind(this.prisma); }
  get $queryRaw() { return this.prisma.$queryRaw.bind(this.prisma); }
  get $queryRawUnsafe() { return this.prisma.$queryRawUnsafe.bind(this.prisma); }
}