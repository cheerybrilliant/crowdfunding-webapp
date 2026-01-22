import Paystack from 'paystack';
import { config } from '../config';

const paystack = Paystack(config.PAYSTACK_SECRET_KEY);

export const initializePayment = async (email: string, amount: number, reference: string, callbackUrl: string) => {
  return await paystack.transaction.initialize({
    email,
    amount: amount * 100, // in kobo
    reference,
    callback_url: callbackUrl,
  });
};

export const verifyPayment = async (reference: string) => {
  return await paystack.transaction.verify(reference);
};

// Webhook handler (in donation.controller)
export const handleWebhook = (payload: any) => {
  // Verify signature, update donation status
  // Use paystack.verifyWebhook or manual HMAC
};