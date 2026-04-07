import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { SecurityService } from '../security/security.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly security: SecurityService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string) {
    // Anti-abuse: limit signups per IP
    if (await this.security.isSignupBlocked(ip)) {
      throw new HttpException('Too many registration attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        profile: {
          create: { firstName: dto.firstName, lastName: dto.lastName },
        },
      },
      include: { profile: true },
    });

    await this.security.recordSignup(ip);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    this.logger.log(`User registered: id=${user.id} email=${user.email} ip=${ip}`);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    // Check if login is blocked (brute-force protection)
    const blocked = await this.security.isLoginBlocked(ip, dto.email);
    if (blocked.blocked) {
      throw new UnauthorizedException(blocked.reason);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user || user.deletedAt) {
      await this.security.recordFailedLogin(ip, dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      await this.security.recordFailedLogin(ip, dto.email);
      throw new UnauthorizedException('Account is not active');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.security.recordFailedLogin(ip, dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success — clear failed login counter
    await this.security.clearFailedLogins(dto.email);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string, ip: string, userAgent: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored?.family) {
        // ── TOKEN REUSE DETECTED ──
        // A previously-used refresh token was replayed → revoke entire family
        // and invalidate all access tokens (possible token theft).
        await this.prisma.refreshToken.updateMany({
          where: { family: stored.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        await this.security.invalidateUserTokens(stored.userId);
        await this.security.logSuspiciousActivity({
          type: 'REFRESH_TOKEN_REUSE',
          ip,
          userId: stored.userId,
          userAgent,
          details: `Refresh token reuse detected for family ${stored.family}`,
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: revoke current token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Account unavailable');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent, stored.family);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    // Invalidate all access tokens issued before now (checked in JwtAuthGuard via Redis)
    await this.security.invalidateUserTokens(userId);

    // Revoke refresh tokens
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      // No specific token → revoke all
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    ip: string,
    userAgent: string,
    family?: string,
  ) {
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family: family || crypto.randomUUID(),
        ipAddress: ip || '0.0.0.0',
        userAgent: userAgent || 'unknown',
        expiresAt,
      },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl,
            country: user.profile.country,
          }
        : null,
    };
  }
}
