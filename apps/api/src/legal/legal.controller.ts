import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LegalService } from './legal.service';
import { Public, Roles } from '../common/decorators';

@ApiTags('Legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly service: LegalService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':type')
  findByType(@Param('type') type: string) {
    return this.service.findByType(type);
  }

  @ApiBearerAuth()
  @Get('admin/all')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  adminFindAll() {
    return this.service.adminFindAll();
  }

  @ApiBearerAuth()
  @Post()
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  create(@Body() body: { title: string; type: string; version: string; content: string; effectiveAt: string; isActive?: boolean }) {
    return this.service.create(body);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() body: { title?: string; content?: string; isActive?: boolean }) {
    return this.service.update(id, body);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
