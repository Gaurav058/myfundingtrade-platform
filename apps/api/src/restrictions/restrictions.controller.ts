import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RestrictionsService } from './restrictions.service';
import { Public, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Restrictions')
@Controller('restrictions')
export class RestrictionsController {
  constructor(private readonly service: RestrictionsService) {}

  @Public()
  @Get('countries')
  getRestrictedCountries() {
    return this.service.getRestrictedCountries();
  }

  @Public()
  @Get('countries/:code/check')
  checkCountry(@Param('code') code: string) {
    return this.service.checkCountry(code.toUpperCase());
  }

  @ApiBearerAuth()
  @Get('admin/countries')
  @Roles('SUPER_ADMIN')
  adminFindAll(@Query() query: PaginationDto) {
    return this.service.adminFindAll(query);
  }

  @ApiBearerAuth()
  @Post('admin/countries')
  @Roles('SUPER_ADMIN')
  upsert(
    @Body() body: { countryCode: string; countryName: string; type?: string; isActive?: boolean; reason?: string },
  ) {
    return this.service.upsert(body.countryCode.toUpperCase(), body);
  }

  @ApiBearerAuth()
  @Delete('admin/countries/:code')
  @Roles('SUPER_ADMIN')
  remove(@Param('code') code: string) {
    return this.service.remove(code.toUpperCase());
  }
}
