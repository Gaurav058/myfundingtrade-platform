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
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { CurrentUser, Public, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(@Query() query: PaginationDto, @Query('categoryId') categoryId?: string) {
    return this.service.findAllPublished(query, categoryId);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Get('admin/all')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  adminFindAll(@Query() query: PaginationDto) {
    return this.service.adminFindAll(query);
  }

  @ApiBearerAuth()
  @Post()
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  create(@CurrentUser('id') authorId: string, @Body() dto: CreateBlogPostDto) {
    return this.service.create(authorId, dto);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
