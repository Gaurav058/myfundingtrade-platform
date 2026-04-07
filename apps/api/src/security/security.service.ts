import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  // --- Thresholds (configurable via env in the future) ---
  private readonly MAX_FAILED_LOGIN_PER_IP = 20;
  private readonly MAX_FAILED_LOGIN_PER_EMAIL = 5;
  private readonly FAILED_LOGIN_WINDOW = 900; // 15 min
  private readonly MAX_SIGNUPS_PER_IP = 3;
  private readonly SIGNUP_WINDOW = 3600; // 1 hour
  private readonly TOKEN_INVALIDATION_TTL = 900; // 15 min (max access token life)

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // ──────────────────────────────────────────────
  // Failed-Login Tracking
  // ──────────────────────────────────────────────

  async recordFailedLogin(ip: string, email: string): Promise<void> {
    const ipKey = `security:failed_login:ip:${ip}`;
    const emailKey = `security:failed_login:email:${email.toLowerCase()}`;

    const pipeline = this.redis.pipeline();
    pipeline.incr(ipKey);
    pipeline.expire(ipKey, this.FAILED_LOGIN_WINDOW);
    pipeline.incr(emailKey);
    pipeline.expire(emailKey, this.FAILED_LOGIN_WINDOW);
    await pipeline.exec();

    this.logger.warn(
      `Failed login: email=${email} ip=${ip}`,
    );
  }

  async isLoginBlocked(
    ip: string,
    email: string,
  ): Promise<{ blocked: boolean; reason?: string }> {
    const [ipAttempts, emailAttempts] = await Promise.all([
      this.redis.get(`security:failed_login:ip:${ip}`),
      this.redis.get(`security:failed_login:email:${email.toLowerCase()}`),
    ]);

    if (parseInt(ipAttempts || '0', 10) >= this.MAX_FAILED_LOGIN_PER_IP) {
      this.logger.error(`IP blocked: ip=${ip} attempts=${ipAttempts}`);
      return { blocked: true, reason: 'Too many failed attempts. Try again later.' };
    }

    if (parseInt(emailAttempts || '0', 10) >= this.MAX_FAILED_LOGIN_PER_EMAIL) {
      this.logger.error(`Account locked: email=${email} attempts=${emailAttempts}`);
      return { blocked: true, reason: 'Account temporarily locked. Try again later.' };
    }

    return { blocked: false };
  }

  async clearFailedLogins(email: string): Promise<void> {
    await this.redis.del(`security:failed_login:email:${email.toLowerCase()}`);
  }

  // ──────────────────────────────────────────────
  // Signup Abuse Prevention
  // ──────────────────────────────────────────────

  async isSignupBlocked(ip: string): Promise<boolean> {
    const count = await this.redis.get(`security:signup:ip:${ip}`);
    return parseInt(count || '0', 10) >= this.MAX_SIGNUPS_PER_IP;
  }

  async recordSignup(ip: string): Promise<void> {
    const key = `security:signup:ip:${ip}`;
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, this.SIGNUP_WINDOW);
    await pipeline.exec();
  }

  // ──────────────────────────────────────────────
  // Token Invalidation (post-logout / compromise)
  // ──────────────────────────────────────────────

  async invalidateUserTokens(userId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.redis.set(
      `security:token_invalidated:${userId}`,
      now.toString(),
      'EX',
      this.TOKEN_INVALIDATION_TTL,
    );
  }

  async isTokenInvalidated(userId: string, tokenIssuedAt: number): Promise<boolean> {
    const invalidatedAt = await this.redis.get(`security:token_invalidated:${userId}`);
    if (!invalidatedAt) return false;
    return tokenIssuedAt <= parseInt(invalidatedAt, 10);
  }

  // ──────────────────────────────────────────────
  // Suspicious Activity Logging
  // ──────────────────────────────────────────────

  async logSuspiciousActivity(data: {
    type: string;
    ip: string;
    email?: string;
    userId?: string;
    userAgent?: string;
    details?: string;
  }): Promise<void> {
    this.logger.error(
      `[SUSPICIOUS] type=${data.type} ip=${data.ip} email=${data.email || '-'} ` +
        `userId=${data.userId || '-'} details=${data.details || ''}`,
    );

    // Persist for monitoring / dashboards (7-day retention)
    const key = `security:suspicious:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await this.redis.set(key, JSON.stringify({ ...data, ts: new Date().toISOString() }), 'EX', 86400 * 7);
  }
}
