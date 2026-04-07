import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { Public, Roles } from '../common/decorators';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a coupon code' })
  validate(@Param('code') code: string, @Query('amount') amount?: string) {
    return this.couponsService.validate(code, amount ? parseFloat(amount) : undefined);
  }

  @Get()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiOperation({ summary: 'List all coupons (admin)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a coupon' })
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.couponsService.update(id, body);
  }
}
