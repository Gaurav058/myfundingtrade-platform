import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMyProfile(@CurrentUser() user: any) {
    return this.profilesService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(user.id, dto);
  }
}
