import axios from 'axios';
import { config } from '../config';

const MTN_CONFIG = config.MTN;

export const initiateMtnPayment = async (amount: number, phoneNumber: string, reference: string) => {
  const url = `${MTN_CONFIG.ENVIRONMENT === 'sandbox' ? MTN_CONFIG.SANDBOX_URL : MTN_CONFIG.PRODUCTION_URL}/collection/v1_0/requesttopay`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MTN_CONFIG.SUBSCRIPTION_KEY,
    'X-Reference-Id': reference,
    'X-Target-Environment': MTN_CONFIG.ENVIRONMENT,
    'Authorization': `Bearer ${MTN_CONFIG.PRIMARY_KEY}`,
    'Content-Type': 'application/json',
  };
  const data = {
    amount: amount.toString(),
    currency: MTN_CONFIG.CURRENCY,
    externalId: reference,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phoneNumber,
    },
    payerMessage: 'Payment for donation',
    payeeNote: 'Thank you for supporting',
  };
  return axios.post(url, data, { headers });
};

export const verifyMtnPayment = async (reference: string) => {
  const url = `${MTN_CONFIG.ENVIRONMENT === 'sandbox' ? MTN_CONFIG.SANDBOX_URL : MTN_CONFIG.PRODUCTION_URL}/collection/v1_0/requesttopay/${reference}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': MTN_CONFIG.SUBSCRIPTION_KEY,
    'X-Target-Environment': MTN_CONFIG.ENVIRONMENT,
    'Authorization': `Bearer ${MTN_CONFIG.PRIMARY_KEY}`,
  };
  return axios.get(url, { headers });
};