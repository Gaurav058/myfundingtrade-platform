import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { Roles } from '../common/decorators';

@ApiTags('Rules')
@ApiBearerAuth()
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiOperation({ summary: 'List all challenge rule sets' })
  findAll() {
    return this.rulesService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiOperation({ summary: 'Get rule set by ID' })
  findById(@Param('id') id: string) {
    return this.rulesService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new rule set' })
  create(@Body() body: any) {
    return this.rulesService.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a rule set' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.rulesService.update(id, body);
  }
}
