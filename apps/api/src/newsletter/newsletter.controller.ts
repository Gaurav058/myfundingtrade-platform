import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { Public, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Public()
  @Post('subscribe')
  subscribe(@Body('email') email: string) {
    return this.service.subscribe(email);
  }

  @Public()
  @Post('unsubscribe')
  unsubscribe(@Body('email') email: string) {
    return this.service.unsubscribe(email);
  }

  @ApiBearerAuth()
  @Get('admin')
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  @ApiQuery({ name: 'activeOnly', required: false })
  adminFindAll(@Query() query: PaginationDto, @Query('activeOnly') activeOnly?: string) {
    return this.service.adminFindAll(query, activeOnly === 'true');
  }
}
