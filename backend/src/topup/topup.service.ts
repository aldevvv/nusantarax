import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopupRequestStatus, PaymentType, PaymentStatus } from '@prisma/client';
import { MidtransService } from '../midtrans/midtrans.service';
import { PromoService } from '../promo/promo.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class TopupService {
  private supabase;

  constructor(
    private prisma: PrismaService,
    private midtransService: MidtransService,
    private promoService: PromoService
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }

  async createManualTopupRequest(
    userId: string,
    amount: number,
    paymentMethod: string
  ) {
    if (amount < 5000) {
      throw new BadRequestException('Minimum topup amount is Rp 5.000');
    }

    const amountInIDR = Math.round(amount);

    const topupRequest = await this.prisma.topupRequest.create({
      data: {
        userId,
        amount: amountInIDR,
        paymentMethod,
        status: TopupRequestStatus.PENDING,
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

    return {
      ...topupRequest,
      amountFormatted: this.formatCurrency(topupRequest.amount),
    };
  }

  async uploadProofImage(
    topupRequestId: string,
    file: Express.Multer.File,
    userId: string
  ) {
    // Verify the topup request belongs to the user
    const topupRequest = await this.prisma.topupRequest.findFirst({
      where: {
        id: topupRequestId,
        userId,
        status: TopupRequestStatus.PENDING,
      },
    });

    if (!topupRequest) {
      throw new NotFoundException('Topup request not found or already processed');
    }

    // Generate unique filename
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `topup-proof-${topupRequestId}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('topup-proof')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrl } = this.supabase.storage
      .from('topup-proof')
      .getPublicUrl(fileName);

    // Update topup request with proof URL
    const updatedRequest = await this.prisma.topupRequest.update({
      where: { id: topupRequestId },
      data: {
        proofImageUrl: publicUrl.publicUrl,
        status: TopupRequestStatus.UNDER_REVIEW,
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

    return {
      ...updatedRequest,
      amountFormatted: this.formatCurrency(updatedRequest.amount),
    };
  }

  async validatePromoCode(code: string, amount: number, userId: string) {
    // Delegate to PromoService - single source of truth
    return await this.promoService.validatePromoCode(code, amount, userId);
  }

  async calculateAutomaticTopupAmount(amount: number, promoCode?: string, userId?: string) {
    const baseAmount = Math.round(amount);
    const processingFee = 0; // FREE
    let discountAmount = 0;
    let validPromo: any = null;

    if (promoCode && userId) {
      const promoValidation = await this.validatePromoCode(promoCode, baseAmount, userId);
      if (promoValidation.isValid && promoValidation.discountAmount !== undefined) {
        discountAmount = promoValidation.discountAmount;
        validPromo = promoValidation.promoCode;
      }
    }

    const finalAmount = baseAmount + processingFee - discountAmount;

    return {
      baseAmount,
      baseAmountFormatted: this.formatCurrency(baseAmount),
      processingFee,
      processingFeeFormatted: this.formatCurrency(processingFee),
      discountAmount,
      discountAmountFormatted: this.formatCurrency(discountAmount),
      finalAmount,
      finalAmountFormatted: this.formatCurrency(finalAmount),
      appliedPromo: validPromo,
    };
  }

  async processAutomaticTopup(
    userId: string,
    amount: number,
    promoCode?: string
  ) {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Calculate final amount with promo
      const calculation = await this.calculateAutomaticTopupAmount(amount, promoCode, userId);

      // No need for additional validation - PromoService already handles all validation

      // Create Midtrans Snap token with final amount (discounted amount for payment)
      const { snapToken, orderId } = await this.midtransService.createTopupSnapToken(
        userId,
        calculation.finalAmount,
        {
          fullName: user.fullName,
          email: user.email,
        }
      );

      // Create pending payment history record - IMPORTANT: store original amount for wallet credit
      const paymentHistory = await this.prisma.paymentHistory.create({
        data: {
          userId,
          type: PaymentType.WALLET_TOPUP,
          amount: calculation.baseAmount, // Store original amount (1jt) for wallet credit!
          description: 'Automatic Topup by Midtrans',
          status: PaymentStatus.PENDING,
          paymentMethod: 'midtrans_automatic',
          externalId: orderId,
          notes: promoCode
            ? `Promo: ${promoCode}, Discount: ${calculation.discountAmountFormatted}, Paid: ${calculation.finalAmountFormatted}`
            : null,
        },
      });

      return {
        snapToken,
        orderId,
        paymentId: paymentHistory.id,
        calculation,
        promoCodeId: calculation.appliedPromo?.id,
        discountAmount: calculation.discountAmount,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to process automatic topup: ${error.message}`);
    }
  }

  async handleMidtransWebhook(notificationData: any) {
    try {
      const notification = await this.midtransService.handleNotification(notificationData);
      
      if (!notification.isValid) {
        return { success: false, message: 'Invalid transaction' };
      }

      // Find payment history by external ID (order ID)
      const paymentHistory = await this.prisma.paymentHistory.findFirst({
        where: {
          externalId: notification.orderId,
          type: PaymentType.WALLET_TOPUP,
        },
      });

      if (!paymentHistory) {
        throw new NotFoundException('Payment record not found');
      }

      // Update payment status and wallet balance if successful
      if (notification.transactionStatus === 'settlement' ||
          (notification.transactionStatus === 'capture' && notification.fraudStatus === 'accept')) {
        
        // Parse promo info from notes if exists
        let promoCodeId: string | null = null;
        let discountAmount = 0;
        
        if (paymentHistory.notes?.includes('Promo:')) {
          // Extract promo code from notes
          const promoMatch = paymentHistory.notes.match(/Promo:\s*([A-Z0-9]+)/);
          const discountMatch = paymentHistory.notes.match(/Discount:\s*Rp\s*([\d.,]+)/);
          
          if (promoMatch) {
            const extractedCode = promoMatch[1];
            const promoCode = await this.prisma.promoCode.findFirst({
              where: { code: extractedCode },
            });
            
            if (promoCode) {
              promoCodeId = promoCode.id;
              // Parse discount amount from formatted string
              if (discountMatch) {
                discountAmount = parseInt(discountMatch[1].replace(/[.,]/g, ''));
              }
            }
          }
        }

        await this.prisma.$transaction(async (tx) => {
          // Update payment status
          await tx.paymentHistory.update({
            where: { id: paymentHistory.id },
            data: { status: PaymentStatus.COMPLETED },
          });

          // Update wallet balance with ORIGINAL amount (not discounted amount)
          await tx.userWallet.upsert({
            where: { userId: paymentHistory.userId },
            update: {
              balance: { increment: paymentHistory.amount }, // This is now baseAmount (1jt)
              totalDeposited: { increment: paymentHistory.amount },
            },
            create: {
              userId: paymentHistory.userId,
              balance: paymentHistory.amount,
              totalDeposited: paymentHistory.amount,
              totalSpent: 0,
            },
          });

          // Track promo usage if promo was used
          if (promoCodeId && discountAmount > 0) {
            // Create promo usage record
            await tx.topupPromoUsage.create({
              data: {
                userId: paymentHistory.userId,
                promoCodeId,
                paymentHistoryId: paymentHistory.id,
                discountAmount,
              },
            });

            // Update promo code usage statistics
            await tx.promoCode.update({
              where: { id: promoCodeId },
              data: {
                currentUsage: { increment: 1 },
              },
            });
          }
        });

        return { success: true, message: 'Payment completed successfully' };
      } else {
        // Update payment status to failed
        await this.prisma.paymentHistory.update({
          where: { id: paymentHistory.id },
          data: { status: PaymentStatus.FAILED },
        });

        return { success: false, message: 'Payment failed or cancelled' };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new BadRequestException(`Failed to process webhook: ${error.message}`);
    }
  }

  async getTopupRequest(id: string, userId: string) {
    const topupRequest = await this.prisma.topupRequest.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        paymentHistory: true,
      },
    });

    if (!topupRequest) {
      throw new NotFoundException('Topup request not found');
    }

    return {
      ...topupRequest,
      amountFormatted: this.formatCurrency(topupRequest.amount),
    };
  }

  async getUserTopupRequests(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const [requests, total] = await Promise.all([
      this.prisma.topupRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          paymentHistory: true,
        },
      }),
      this.prisma.topupRequest.count({
        where: { userId },
      }),
    ]);

    return {
      requests: requests.map(request => ({
        ...request,
        amountFormatted: this.formatCurrency(request.amount),
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  // Admin methods
  async getAllTopupRequests(
    page: number = 1,
    limit: number = 20,
    status?: TopupRequestStatus
  ) {
    const skip = (page - 1) * limit;
    const whereCondition = status ? { status } : {};

    const [requests, total] = await Promise.all([
      this.prisma.topupRequest.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          paymentHistory: true,
        },
      }),
      this.prisma.topupRequest.count({
        where: whereCondition,
      }),
    ]);

    return {
      requests: requests.map(request => ({
        ...request,
        amountFormatted: this.formatCurrency(request.amount),
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

  async approveTopupRequest(
    requestId: string,
    adminId: string,
    notes?: string
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Get the topup request
      const topupRequest = await tx.topupRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!topupRequest) {
        throw new NotFoundException('Topup request not found');
      }

      if (topupRequest.status !== TopupRequestStatus.UNDER_REVIEW) {
        throw new BadRequestException('Request is not under review');
      }

      // Update wallet balance
      await tx.userWallet.upsert({
        where: { userId: topupRequest.userId },
        update: {
          balance: { increment: topupRequest.amount },
          totalDeposited: { increment: topupRequest.amount },
        },
        create: {
          userId: topupRequest.userId,
          balance: topupRequest.amount,
          totalDeposited: topupRequest.amount,
          totalSpent: 0,
        },
      });

      // Create payment history
      const paymentHistory = await tx.paymentHistory.create({
        data: {
          userId: topupRequest.userId,
          type: PaymentType.WALLET_TOPUP,
          amount: topupRequest.amount,
          description: 'Manual Topup by Admin',
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'manual_admin',
          processedBy: adminId,
          notes,
        },
      });

      // Update topup request
      const updatedRequest = await tx.topupRequest.update({
        where: { id: requestId },
        data: {
          status: TopupRequestStatus.APPROVED,
          reviewedBy: adminId,
          reviewNotes: notes,
          reviewedAt: new Date(),
          paymentHistoryId: paymentHistory.id,
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

      return {
        ...updatedRequest,
        amountFormatted: this.formatCurrency(updatedRequest.amount),
      };
    });
  }

  async rejectTopupRequest(
    requestId: string,
    adminId: string,
    reason: string
  ) {
    const topupRequest = await this.prisma.topupRequest.findUnique({
      where: { id: requestId },
    });

    if (!topupRequest) {
      throw new NotFoundException('Topup request not found');
    }

    if (topupRequest.status !== TopupRequestStatus.UNDER_REVIEW) {
      throw new BadRequestException('Request is not under review');
    }

    const updatedRequest = await this.prisma.topupRequest.update({
      where: { id: requestId },
      data: {
        status: TopupRequestStatus.REJECTED,
        reviewedBy: adminId,
        reviewNotes: reason,
        reviewedAt: new Date(),
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

    return {
      ...updatedRequest,
      amountFormatted: this.formatCurrency(updatedRequest.amount),
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