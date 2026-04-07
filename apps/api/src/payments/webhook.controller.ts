import { Controller, Post, Req, Headers, Logger, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../common/decorators';
import { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('stripe')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');

    const rawBody = req.rawBody;
    if (!rawBody) throw new BadRequestException('Missing raw body — ensure raw body parsing is configured');

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err: any) {
      this.logger.warn(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Webhook received: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.paymentsService.handleCheckoutComplete(event.data.object as any);
        break;

      case 'checkout.session.expired':
        await this.paymentsService.handleCheckoutExpired(event.data.object as any);
        break;

      case 'charge.refunded':
        await this.paymentsService.handleChargeRefunded(event.data.object as any);
        break;

      case 'charge.dispute.created':
        await this.paymentsService.handleDisputeCreated(event.data.object as any);
        break;

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
