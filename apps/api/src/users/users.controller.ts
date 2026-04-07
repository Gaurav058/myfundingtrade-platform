import { Controller, Get, Param, Query, Patch, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiOperation({ summary: 'List all users (admin)' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll(pagination, { role, status });
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT')
  @ApiOperation({ summary: 'Get user by ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update user status' })
  updateStatus(@Param('id') id: string, @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED') {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete a user' })
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
