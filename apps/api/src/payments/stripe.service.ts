import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

// In CJS mode, the default export is a StripeConstructor function.
// Access the Stripe instance type from the nested namespace.
type StripeClient = Stripe.Stripe;

export interface CheckoutSessionInput {
  orderId: string;
  orderNumber: string;
  amount: number; // in dollars
  currency: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe!: StripeClient;
  private readonly logger = new Logger(StripeService.name);
  private webhookSecret!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not set — Stripe integration disabled');
      return;
    }

    this.stripe = new (Stripe as any)(secretKey) as StripeClient;
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    this.logger.log('Stripe client initialised');
  }

  get isEnabled(): boolean {
    return !!this.stripe;
  }

  async createCheckoutSession(input: CheckoutSessionInput) {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: input.customerEmail,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: Math.round(input.amount * 100), // cents
            product_data: {
              name: input.description,
              metadata: { orderId: input.orderId },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        ...input.metadata,
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 min from now
    });
  }

  async retrieveSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    const params: Record<string, any> = {
      payment_intent: paymentIntentId,
    };
    if (amount) {
      params.amount = Math.round(amount * 100); // cents
    }
    return this.stripe.refunds.create(params);
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }
}
