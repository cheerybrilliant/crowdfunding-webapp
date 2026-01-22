import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/cancercare',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
  JWT_EXPIRE: '7d',

  // Paystack
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',

  // MTN Payment
  MTN: {
    API_KEY: process.env.MTN_API_KEY || '',
    API_SECRET: process.env.MTN_API_SECRET || '',
    SUBSCRIPTION_KEY: process.env.MTN_SUBSCRIPTION_KEY || '',
    PRIMARY_KEY: process.env.MTN_PRIMARY_KEY || '',
    SECONDARY_KEY: process.env.MTN_SECONDARY_KEY || '',
    BUSINESS_PARTNER_ID: process.env.MTN_BUSINESS_PARTNER_ID || '',
    BUSINESS_PARTNER_PIN: process.env.MTN_BUSINESS_PARTNER_PIN || '',
    ENVIRONMENT: process.env.PAYMENT_ENV || 'sandbox',
    SANDBOX_URL: 'https://sandbox.momodeveloper.mtn.com',
    PRODUCTION_URL: 'https://api.mtn.com',
    CURRENCY: 'XAF',
    COUNTRY: 'CM',
  },

  // Hospital
  HOSPITAL_VERIFICATION_CODE: process.env.HOSPITAL_VERIFICATION_CODE || '',

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173',

  // API
  API_TIMEOUT: 30000,
};

export default config;
