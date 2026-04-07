import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChallengePlansService } from './challenge-plans.service';
import { Public } from '../common/decorators';

@ApiTags('Challenge Plans')
@Controller('challenge-plans')
export class ChallengePlansController {
  constructor(private readonly service: ChallengePlansService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active challenge plans with variants' })
  findAll(@Query('all') all?: string) {
    return this.service.findAllPlans(all !== 'true');
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get challenge plan by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findPlanBySlug(slug);
  }

  @Public()
  @Get('variants/:id')
  @ApiOperation({ summary: 'Get a specific variant with plan and rules' })
  findVariant(@Param('id') id: string) {
    return this.service.findVariantById(id);
  }
}
