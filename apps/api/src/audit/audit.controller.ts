import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiQuery({ name: 'performerId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  findAll(
    @Query() query: PaginationDto,
    @Query('performerId') performerId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
  ) {
    return this.service.findAll(query, { performerId, action, resource });
  }

  @Get('actions')
  @Roles('SUPER_ADMIN')
  getActions() {
    return this.service.getActions();
  }

  @Get('resources')
  @Roles('SUPER_ADMIN')
  getResources() {
    return this.service.getResources();
  }
}
