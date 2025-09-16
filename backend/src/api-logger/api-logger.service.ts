import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiCallStatus } from '@prisma/client';

@Injectable()
export class ApiLoggerService {
  constructor(private prisma: PrismaService) {}

  async logApiCall(data: {
    endpoint: string;
    method: string;
    modelUsed?: string;
    status: ApiCallStatus;
    responseTime?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    errorMessage?: string;
    errorCode?: string;
    userId?: string;
    requestSize?: number;
    responseSize?: number;
  }) {
    try {
      return await this.prisma.apiCallLog.create({
        data,
      });
    } catch (error) {
      console.error('Failed to log API call:', error);
      // Don't throw error - logging should not break main functionality
    }
  }

  async getApiStatistics(timeframe: 'today' | 'week' | 'month' | 'all' = 'month') {
    let dateFilter = {};
    
    const now = new Date();
    switch (timeframe) {
      case 'today':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        };
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = {
          createdAt: {
            gte: weekAgo,
          },
        };
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = {
          createdAt: {
            gte: monthAgo,
          },
        };
        break;
      case 'all':
      default:
        dateFilter = {};
        break;
    }

    const [totalRequests, successRequests, failedRequests, totalTokens, avgResponseTime] = await Promise.all([
      // Total requests
      this.prisma.apiCallLog.count({
        where: dateFilter,
      }),
      
      // Successful requests
      this.prisma.apiCallLog.count({
        where: {
          ...dateFilter,
          status: ApiCallStatus.SUCCESS,
        },
      }),
      
      // Failed requests
      this.prisma.apiCallLog.count({
        where: {
          ...dateFilter,
          status: {
            in: [ApiCallStatus.FAILED, ApiCallStatus.TIMEOUT, ApiCallStatus.RATE_LIMITED],
          },
        },
      }),
      
      // Total tokens used
      this.prisma.apiCallLog.aggregate({
        where: {
          ...dateFilter,
          status: ApiCallStatus.SUCCESS,
        },
        _sum: {
          totalTokens: true,
        },
      }),
      
      // Average response time
      this.prisma.apiCallLog.aggregate({
        where: {
          ...dateFilter,
          status: ApiCallStatus.SUCCESS,
          responseTime: {
            not: null,
          },
        },
        _avg: {
          responseTime: true,
        },
      }),
    ]);

    return {
      totalRequests,
      successRequests,
      failedRequests,
      successRate: totalRequests > 0 ? Math.round((successRequests / totalRequests) * 100) : 0,
      totalTokens: totalTokens._sum.totalTokens || 0,
      avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
      timeframe,
    };
  }

  async getRecentErrors(limit: number = 10) {
    return this.prisma.apiCallLog.findMany({
      where: {
        status: {
          in: [ApiCallStatus.FAILED, ApiCallStatus.TIMEOUT, ApiCallStatus.RATE_LIMITED],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        endpoint: true,
        status: true,
        errorMessage: true,
        errorCode: true,
        createdAt: true,
        modelUsed: true,
      },
    });
  }

  async getModelUsageStats() {
    const modelStats = await this.prisma.apiCallLog.groupBy({
      by: ['modelUsed'],
      where: {
        modelUsed: {
          not: null,
        },
        status: ApiCallStatus.SUCCESS,
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

    return modelStats.map(stat => ({
      model: stat.modelUsed,
      requests: stat._count.id,
      tokens: stat._sum.totalTokens || 0,
    }));
  }
}