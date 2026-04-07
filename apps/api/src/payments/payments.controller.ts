import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser, Roles, GeoRestricted } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @GeoRestricted()
  @ApiOperation({ summary: 'Initiate Stripe checkout for an order' })
  initiateCheckout(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string },
  ) {
    return this.paymentsService.initiateCheckout(body.orderId, userId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment (admin/manual fallback)' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  confirm(@Param('id') id: string, @Body() body: { providerPaymentId: string }) {
    return this.paymentsService.confirmPayment(id, body.providerPaymentId);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment (admin)' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  refund(@Param('id') id: string, @Body() body: { amount?: number }) {
    return this.paymentsService.refundPayment(id, body.amount);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'Admin: list all payments' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminList(
    @Query() query: PaginationDto,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    return this.paymentsService.adminFindAll(query, status, provider);
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Admin: payment detail' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminDetail(@Param('id') id: string) {
    return this.paymentsService.getPaymentDetails(id);
  }
}
