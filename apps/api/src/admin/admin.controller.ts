import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getDashboardStats() {
    return this.service.getDashboardStats();
  }

  @Get('activity')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getRecentActivity(@Query('limit') limit?: string) {
    return this.service.getRecentActivity(limit ? parseInt(limit, 10) : 20);
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getAuditLogs(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.getAuditLogs(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }
}
