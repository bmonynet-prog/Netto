import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET || 'change_me',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  abaPayMerchantId: process.env.ABA_PAY_MERCHANT_ID || '',
  abaPayApiKey: process.env.ABA_PAY_API_KEY || '',
  defaultShippingFee: parseFloat(process.env.DEFAULT_SHIPPING_FEE || '5.00'),
  freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '100.00'),
  isProduction: process.env.NODE_ENV === 'production',
};
