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
  private authApi: AxiosInstance;
  private baseUrl: string;
  private subscriptionKey: string;
  private apiUser: string;
  private apiKey: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {
    this.baseUrl =
      config.MTN.ENVIRONMENT === 'production'
        ? config.MTN.PRODUCTION_URL
        : config.MTN.SANDBOX_URL;

    this.subscriptionKey = config.MTN.SUBSCRIPTION_KEY;
    this.apiUser = config.MTN.API_USER;
    this.apiKey = config.MTN.API_KEY;

    this.api = axios.create({
      baseURL: `${this.baseUrl}/collection/v1_0`,
      timeout: config.API_TIMEOUT,
    });

    this.authApi = axios.create({
      baseURL: `${this.baseUrl}/collection`,
      timeout: config.API_TIMEOUT,
    });
  }

  private getTargetEnvironment(): string {
    return config.MTN.ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.apiUser || !this.apiKey) {
      throw new Error('MTN API user/key missing. Set MTN_API_USER and MTN_API_KEY.');
    }

    const credentials = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');

    try {
      const response = await this.authApi.post(
        '/token/',
        null,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      const expiresIn = Number(response.data.expires_in || 0);
      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 60) * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error('MTN Token Error:', error.response?.data || error.message);
      throw new Error(`Failed to get MTN token: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Initiate a payment request
   */
  async initiatePayment(paymentData: MTNPaymentRequest): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      await this.api.post('/requesttopay', paymentData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'X-Reference-Id': paymentData.externalId,
          'X-Target-Environment': this.getTargetEnvironment(),
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
      const accessToken = await this.getAccessToken();
      const response = await this.api.get(`/requesttopay/${requestId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'X-Target-Environment': this.getTargetEnvironment(),
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
