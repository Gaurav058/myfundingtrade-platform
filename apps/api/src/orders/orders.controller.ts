import { Controller, Post, Get, Param, Query, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, Roles, GeoRestricted } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @GeoRestricted()
  @ApiOperation({ summary: 'Create a new order for a challenge variant' })
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto, @Req() req: Request) {
    return this.ordersService.create(user.id, dto, req.ip, req.headers['user-agent']);
  }

  @Get()
  @ApiOperation({ summary: 'List current user orders' })
  findAll(@CurrentUser() user: any, @Query() query: PaginationDto) {
    return this.ordersService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findById(id, user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order' })
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.id);
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'Admin: list all orders' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminList(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.ordersService.adminFindAll(query, status);
  }

  @Post('admin/:id/cancel')
  @ApiOperation({ summary: 'Admin: cancel an order' })
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminCancel(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
