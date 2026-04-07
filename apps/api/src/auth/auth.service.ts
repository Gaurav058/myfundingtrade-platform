import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string) {
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

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

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
        await this.prisma.refreshToken.updateMany({
          where: { family: stored.family, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

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
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    await this.redis.set(`blacklist:${userId}:${Date.now()}`, '1', 'EX', 900);
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
