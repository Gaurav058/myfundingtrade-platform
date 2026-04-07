import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment for an order' })
  create(@Body() body: { orderId: string; provider: 'STRIPE' | 'CRYPTO' | 'BANK_TRANSFER' | 'MANUAL' }) {
    return this.paymentsService.createPayment(body.orderId, body.provider);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment (webhook/admin)' })
  confirm(@Param('id') id: string, @Body() body: { providerPaymentId: string }) {
    return this.paymentsService.confirmPayment(id, body.providerPaymentId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }
}
