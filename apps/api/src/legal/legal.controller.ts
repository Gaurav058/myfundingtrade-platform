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
import { CreateLegalDocumentDto, UpdateLegalDocumentDto } from './dto/legal.dto';
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
  create(@Body() dto: CreateLegalDocumentDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateLegalDocumentDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
