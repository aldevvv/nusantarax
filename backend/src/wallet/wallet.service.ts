import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentType, PaymentStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.userWallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await this.prisma.userWallet.create({
        data: {
          userId,
          balance: 0,
          totalDeposited: 0,
          totalSpent: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    }

    return {
      ...wallet,
      balanceFormatted: this.formatCurrency(wallet.balance),
      totalDepositedFormatted: this.formatCurrency(wallet.totalDeposited),
      totalSpentFormatted: this.formatCurrency(wallet.totalSpent),
    };
  }

  async getWalletTransactions(userId: string, limit: number = 50, offset: number = 0) {
    const transactions = await this.prisma.paymentHistory.findMany({
      where: {
        userId,
        type: {
          in: [PaymentType.WALLET_TOPUP, PaymentType.SUBSCRIPTION, PaymentType.DEDUCTION]
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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
      where: {
        userId,
        type: {
          in: [PaymentType.WALLET_TOPUP, PaymentType.SUBSCRIPTION, PaymentType.DEDUCTION]
        },
      },
    });

    return {
      transactions: transactions.map(tx => ({
        ...tx,
        amountFormatted: this.formatCurrency(Math.abs(tx.amount)), // Use absolute value for display
        amountDisplay: tx.type === PaymentType.WALLET_TOPUP ? `+${this.formatCurrency(tx.amount)}` : `-${this.formatCurrency(tx.amount)}`,
        isCredit: tx.type === PaymentType.WALLET_TOPUP,
        isDebit: tx.type === PaymentType.SUBSCRIPTION || tx.type === PaymentType.DEDUCTION,
        paymentMethod: tx.paymentMethod,
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  async addFunds(userId: string, amount: number, description?: string, adminId?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Convert to integer (IDR doesn't use cents)
    const amountInIDR = Math.round(amount);

    return await this.prisma.$transaction(async (tx) => {
      // Update wallet balance
      const wallet = await tx.userWallet.upsert({
        where: { userId },
        update: {
          balance: {
            increment: amountInIDR,
          },
          totalDeposited: {
            increment: amountInIDR,
          },
        },
        create: {
          userId,
          balance: amountInIDR,
          totalDeposited: amountInIDR,
          totalSpent: 0,
        },
      });

      // Create payment history record
      const payment = await tx.paymentHistory.create({
        data: {
          userId,
          type: PaymentType.WALLET_TOPUP,
          amount: amountInIDR,
          description: adminId
            ? (description || `Manual Topup by Admin`)
            : `Automatic Topup by Midtrans`,
          status: PaymentStatus.COMPLETED,
          paymentMethod: adminId ? 'manual_admin' : 'midtrans_automatic',
          processedBy: adminId,
        },
      });

      return {
        wallet: {
          ...wallet,
          balanceFormatted: this.formatCurrency(wallet.balance),
        },
        payment: {
          ...payment,
          amountFormatted: this.formatCurrency(payment.amount),
        },
      };
    });
  }


  async getWalletStats(userId: string) {
    const wallet = await this.getWallet(userId);
    
    const [recentTransactions, totalTransactions] = await Promise.all([
      this.getWalletTransactions(userId, 5),
      this.prisma.paymentHistory.count({
        where: {
          userId,
          type: {
            in: [PaymentType.WALLET_TOPUP, PaymentType.SUBSCRIPTION, PaymentType.DEDUCTION]
          },
        },
      }),
    ]);

    const lastTopUp = await this.prisma.paymentHistory.findFirst({
      where: {
        userId,
        type: PaymentType.WALLET_TOPUP,
        status: PaymentStatus.COMPLETED,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      balance: wallet.balance,
      balanceFormatted: wallet.balanceFormatted,
      totalDeposited: wallet.totalDeposited,
      totalDepositedFormatted: wallet.totalDepositedFormatted,
      totalSpent: wallet.totalSpent,
      totalSpentFormatted: wallet.totalSpentFormatted,
      totalTransactions,
      lastTopUp: lastTopUp ? {
        ...lastTopUp,
        amountFormatted: this.formatCurrency(lastTopUp.amount),
      } : null,
      recentTransactions: recentTransactions.transactions,
    };
  }

  async getAllWallets(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    let whereCondition: any = {};
    
    if (search) {
      whereCondition = {
        user: {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      };
    }

    const [wallets, total] = await Promise.all([
      this.prisma.userWallet.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              emailVerified: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
        },
        orderBy: [
          { balance: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.userWallet.count({
        where: whereCondition,
      }),
    ]);

    const walletsWithFormatting = wallets.map(wallet => ({
      ...wallet,
      balanceFormatted: this.formatCurrency(wallet.balance),
      totalDepositedFormatted: this.formatCurrency(wallet.totalDeposited),
      totalSpentFormatted: this.formatCurrency(wallet.totalSpent),
    }));

    return {
      wallets: walletsWithFormatting,
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

  async deductFunds(
    userId: string,
    amount: number,
    description: string,
  ) {
    const amountInIDR = Math.round(amount);

    // Get wallet with current balance
    const wallet = await this.getWallet(userId);
    
    if (wallet.balance < amountInIDR) {
      throw new Error('Insufficient balance for deduction');
    }

    // Create deduction transaction and update wallet
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update wallet balance
      const updatedWallet = await prisma.userWallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: amountInIDR,
          },
          totalSpent: {
            increment: amountInIDR,
          },
        },
      });

      // Create payment history record
      const transaction = await prisma.paymentHistory.create({
        data: {
          userId,
          type: 'DEDUCTION',
          amount: -amountInIDR, // Negative amount for deduction
          description,
          status: 'COMPLETED',
          paymentMethod: 'manual_admin',
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return {
      wallet: result.wallet,
      transaction: result.transaction,
      newBalance: this.formatCurrency(result.wallet.balance),
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
}
