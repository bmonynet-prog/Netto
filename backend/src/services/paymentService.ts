import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { env } from '../config/env';

// -----------------------------------------------------------------------
// Payment provider abstraction.
//
// This module defines a common interface so the order/checkout flow never
// needs to know which concrete payment provider is being used. Real card
// details are NEVER handled or stored by this backend — for Stripe, the
// frontend would use Stripe.js/Elements to tokenize card data directly
// with Stripe, and only a token/paymentIntentId would ever reach us.
// -----------------------------------------------------------------------

export interface PaymentIntentResult {
  status: PaymentStatus;
  transactionRef: string | null;
  clientSecret?: string; // for providers that need client-side confirmation (e.g. Stripe)
  redirectUrl?: string; // for redirect-based providers (e.g. ABA Pay)
}

export interface PaymentProvider {
  createPaymentIntent(orderId: string, amount: number): Promise<PaymentIntentResult>;
}

// Cash on Delivery: no online transaction, payment collected on delivery.
class CashOnDeliveryProvider implements PaymentProvider {
  async createPaymentIntent(_orderId: string, _amount: number): Promise<PaymentIntentResult> {
    return { status: PaymentStatus.PENDING, transactionRef: null };
  }
}

// Stripe placeholder. In production, this would call the Stripe SDK
// (stripe.paymentIntents.create) using STRIPE_SECRET_KEY and return the
// client_secret for the frontend to confirm the payment with Stripe.js.
class StripeProvider implements PaymentProvider {
  async createPaymentIntent(orderId: string, amount: number): Promise<PaymentIntentResult> {
    if (!env.stripeSecretKey) {
      // Fail gracefully in dev/demo environments without real Stripe keys.
      return { status: PaymentStatus.PENDING, transactionRef: `stripe_demo_${orderId}` };
    }
    // Real integration would look roughly like:
    // const stripe = new Stripe(env.stripeSecretKey);
    // const intent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: 'usd', metadata: { orderId } });
    // return { status: PaymentStatus.PENDING, transactionRef: intent.id, clientSecret: intent.client_secret };
    return { status: PaymentStatus.PENDING, transactionRef: `stripe_${orderId}` };
  }
}

// ABA Pay placeholder (popular payment gateway in Cambodia). A real
// integration would generate a signed checkout request and return a
// redirect URL for the hosted payment page.
class AbaPayProvider implements PaymentProvider {
  async createPaymentIntent(orderId: string, _amount: number): Promise<PaymentIntentResult> {
    if (!env.abaPayApiKey) {
      return { status: PaymentStatus.PENDING, transactionRef: `aba_demo_${orderId}` };
    }
    return {
      status: PaymentStatus.PENDING,
      transactionRef: `aba_${orderId}`,
      redirectUrl: `https://checkout.payway.com.kh/pay/${orderId}`,
    };
  }
}

const providers: Record<PaymentMethod, PaymentProvider> = {
  [PaymentMethod.COD]: new CashOnDeliveryProvider(),
  [PaymentMethod.STRIPE]: new StripeProvider(),
  [PaymentMethod.ABA_PAY]: new AbaPayProvider(),
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  return providers[method];
}
