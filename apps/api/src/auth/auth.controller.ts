import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { Public, CurrentUser } from '../common/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new trader account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive tokens' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@CurrentUser() user: any, @Body() body: { refreshToken?: string }) {
    return this.authService.logout(user.id, body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }
}
