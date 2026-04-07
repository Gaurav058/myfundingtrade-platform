import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { Public, Roles } from '../common/decorators';

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Public()
  @Get('public')
  getPublic() {
    return this.service.getPublic();
  }

  @ApiBearerAuth()
  @Get()
  @Roles('SUPER_ADMIN')
  getAll() {
    return this.service.getAll();
  }

  @ApiBearerAuth()
  @Get(':key')
  @Roles('SUPER_ADMIN')
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @ApiBearerAuth()
  @Post()
  @Roles('SUPER_ADMIN')
  upsert(@Body() body: { key: string; value: any; description?: string; isPublic?: boolean }) {
    return this.service.upsert(body.key, body.value, body.description, body.isPublic);
  }

  @ApiBearerAuth()
  @Delete(':key')
  @Roles('SUPER_ADMIN')
  remove(@Param('key') key: string) {
    return this.service.remove(key);
  }
}
