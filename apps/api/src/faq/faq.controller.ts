import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { Public, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    return this.service.findAllPublished(category);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.service.getCategories();
  }

  @ApiBearerAuth()
  @Get('admin')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  adminFindAll(@Query() query: PaginationDto) {
    return this.service.adminFindAll(query);
  }

  @ApiBearerAuth()
  @Post()
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  create(@Body() body: { question: string; answer: string; category?: string; sortOrder?: number; isPublished?: boolean }) {
    return this.service.create(body);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() body: { question?: string; answer?: string; category?: string; sortOrder?: number; isPublished?: boolean }) {
    return this.service.update(id, body);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
