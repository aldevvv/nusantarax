import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const midtransClient = require('midtrans-client');

interface PaymentItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface CustomerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface TransactionDetails {
  order_id: string;
  gross_amount: number;
}

interface SnapTransactionRequest {
  transaction_details: TransactionDetails;
  item_details: PaymentItem[];
  customer_details: CustomerDetails;
  credit_card?: {
    secure: boolean;
  };
  callbacks?: {
    finish: string;
  };
}

@Injectable()
export class MidtransService {
  private snap: any;
  private core: any;

  constructor(private configService: ConfigService) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const isProduction = this.configService.get<string>('MIDTRANS_ENVIRONMENT') === 'production';

    if (!serverKey) {
      throw new Error('MIDTRANS_SERVER_KEY is required');
    }

    // Initialize Snap API
    this.snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });

    // Initialize Core API (for transaction status checking)
    this.core = new midtransClient.CoreApi({
      isProduction,
      serverKey,
      clientKey: this.configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createSnapToken(
    orderId: string,
    grossAmount: number,
    customerDetails: CustomerDetails,
    itemDetails: PaymentItem[]
  ): Promise<string> {
    try {
      const parameter: SnapTransactionRequest = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: itemDetails,
        customer_details: customerDetails,
        credit_card: {
          secure: true,
        },
        callbacks: {
          finish: `${this.configService.get('FRONTEND_URL')}/dashboard/wallet?payment=success`,
        },
      };

      const transaction = await this.snap.createTransaction(parameter);
      return transaction.token;
    } catch (error) {
      console.error('Midtrans Snap Token Error:', error);
      throw new BadRequestException(`Failed to create payment token: ${error.message}`);
    }
  }

  async createTopupSnapToken(
    userId: string,
    amount: number,
    userDetails: {
      fullName: string;
      email: string;
      phone?: string;
    }
  ): Promise<{
    snapToken: string;
    orderId: string;
  }> {
    const orderId = `TOPUP-${userId}-${Date.now()}`;
    
    // Split full name into first and last name
    const nameParts = userDetails.fullName.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'NusantaraX';

    const customerDetails: CustomerDetails = {
      first_name: firstName,
      last_name: lastName,
      email: userDetails.email,
      phone: userDetails.phone || '081234567890',
    };

    const itemDetails: PaymentItem[] = [
      {
        id: 'WALLET_TOPUP',
        price: amount,
        quantity: 1,
        name: `Wallet Top Up - ${this.formatCurrency(amount)}`,
      },
    ];

    const snapToken = await this.createSnapToken(
      orderId,
      amount,
      customerDetails,
      itemDetails
    );

    return {
      snapToken,
      orderId,
    };
  }

  async getTransactionStatus(orderId: string): Promise<any> {
    try {
      const response = await this.core.transaction.status(orderId);
      return response;
    } catch (error) {
      console.error('Midtrans Transaction Status Error:', error);
      throw new BadRequestException(`Failed to get transaction status: ${error.message}`);
    }
  }

  async handleNotification(notificationJson: any): Promise<{
    isValid: boolean;
    transactionStatus: string;
    orderId: string;
    grossAmount: string;
    fraudStatus?: string;
  }> {
    try {
      const statusResponse = await this.core.transaction.notification(notificationJson);
      
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      const grossAmount = statusResponse.gross_amount;

      console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

      // Determine if transaction is successful
      let isValid = false;
      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          // TODO: Handle challenge transaction
          isValid = false;
        } else if (fraudStatus === 'accept') {
          isValid = true;
        }
      } else if (transactionStatus === 'settlement') {
        isValid = true;
      } else if (
        transactionStatus === 'cancel' ||
        transactionStatus === 'deny' ||
        transactionStatus === 'expire'
      ) {
        isValid = false;
      } else if (transactionStatus === 'pending') {
        isValid = false;
      }

      return {
        isValid,
        transactionStatus,
        orderId,
        grossAmount,
        fraudStatus,
      };
    } catch (error) {
      console.error('Midtrans Notification Error:', error);
      throw new BadRequestException(`Failed to process notification: ${error.message}`);
    }
  }

  // Utility method to validate signature (optional but recommended for security)
  validateSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): boolean {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const crypto = require('crypto');
    
    const expectedSignature = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex');

    return expectedSignature === signatureKey;
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