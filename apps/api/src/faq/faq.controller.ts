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
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
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
  create(@Body() dto: CreateFaqDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
