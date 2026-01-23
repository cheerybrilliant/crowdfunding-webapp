import axios, { AxiosInstance } from 'axios';
import { config } from './config';

interface MTNPaymentRequest {
  amount: number;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage?: string;
  payeeNote?: string;
}


export class MTNPaymentService {
  private api: AxiosInstance;
  private baseUrl: string;
  private subscriptionKey: string;

  constructor() {
    this.baseUrl =
      config.MTN.ENVIRONMENT === 'production'
        ? config.MTN.PRODUCTION_URL
        : config.MTN.SANDBOX_URL;

    this.subscriptionKey = config.MTN.SUBSCRIPTION_KEY;

    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: config.API_TIMEOUT,
    });
  }

  /**
   * Initiate a payment request
   */
  async initiatePayment(paymentData: MTNPaymentRequest): Promise<any> {
    try {
      await this.api.post('/v1_0/requesttopay', paymentData, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'X-Reference-Id': paymentData.externalId,
          'Content-Type': 'application/json',
        },
      });

      return {
        requestId: paymentData.externalId,
        status: 'initiated',
        message: 'Payment request initiated successfully',
      };
    } catch (error: any) {
      console.error('MTN Payment Error:', error.response?.data || error.message);
      throw new Error(`Failed to initiate payment: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(requestId: string): Promise<any> {
    try {
      const response = await this.api.get(`/v1_0/requesttopay/${requestId}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      });

      return {
        requestId,
        status: response.data.status,
        statusDescription: this.getStatusDescription(response.data.status),
        amount: response.data.amount,
        payer: response.data.payer,
      };
    } catch (error: any) {
      console.error('MTN Status Check Error:', error.response?.data || error.message);
      throw new Error(`Failed to check payment status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove common formatting characters
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Check for international format with +237 or just 237
    const validFormats = [
      /^\+237\d{8,9}$/, // +237XXXXXXXXX (9 or 10 digits)
      /^237\d{8,9}$/, // 237XXXXXXXXX
      /^0\d{8,9}$/, // 0XXXXXXXXX
    ];

    return validFormats.some((format) => format.test(cleaned));
  }

  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Remove leading 0 if present and add 237
    if (cleaned.startsWith('0')) {
      cleaned = '237' + cleaned.substring(1);
    }

    // Add 237 if not present
    if (!cleaned.startsWith('237')) {
      cleaned = '237' + cleaned;
    }

    return cleaned;
  }

  /**
   * Generate X-Reference-Id for idempotency
   */
  generateReferenceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get human-readable status description
   */
  private getStatusDescription(status: string): string {
    const descriptions: { [key: string]: string } = {
      PENDING: 'Payment is pending confirmation',
      SUCCESS: 'Payment was successful',
      FAILED: 'Payment failed',
      REJECTED: 'Payment was rejected',
      EXPIRED: 'Payment request expired',
    };

    return descriptions[status] || 'Unknown status';
  }

  /**
   * Prepare payment request for MTN API
   */
  preparePaymentRequest(
    amount: number,
    phoneNumber: string,
    externalId: string,
    payerMessage?: string,
    payeeNote?: string
  ): MTNPaymentRequest {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    if (!this.validatePhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number format');
    }

    return {
      amount,
      currency: config.MTN.CURRENCY,
      externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: formattedPhone,
      },
      payerMessage,
      payeeNote,
    };
  }
}

export const mtnPaymentService = new MTNPaymentService();
