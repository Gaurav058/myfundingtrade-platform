import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { Public, CurrentUser } from '../common/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ long: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new trader account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate and receive tokens' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Accept refresh token from cookie or body (cookie takes precedence)
    const token = req.signedCookies?.refreshToken || dto.refreshToken;
    const result = await this.authService.refresh(token, req.ip || '0.0.0.0', req.headers['user-agent'] || '');
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(
    @CurrentUser() user: any,
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.signedCookies?.refreshToken || body.refreshToken;
    await this.authService.logout(user.id, token);
    this.clearRefreshCookie(res);
    return { message: 'Logged out' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  // ── Cookie helpers ──

  private setRefreshCookie(res: Response, token: string) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isProduction,
      signed: true,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: this.config.get('COOKIE_DOMAIN', undefined),
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      signed: true,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: this.config.get('COOKIE_DOMAIN', undefined),
      path: '/api/v1/auth',
    });
  }
}
