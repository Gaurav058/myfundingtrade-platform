import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async checkReadiness() {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    let overall = true;

    // Database check
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
    } catch (err: any) {
      overall = false;
      checks.database = { status: 'error', latencyMs: Date.now() - dbStart, error: err.message };
      this.logger.error('Database health check failed', err.message);
    }

    // Redis check
    const redisStart = Date.now();
    try {
      await this.redis.ping();
      checks.redis = { status: 'ok', latencyMs: Date.now() - redisStart };
    } catch (err: any) {
      overall = false;
      checks.redis = { status: 'error', latencyMs: Date.now() - redisStart, error: err.message };
      this.logger.error('Redis health check failed', err.message);
    }

    return {
      status: overall ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'myfundingtrade-api',
      uptime: process.uptime(),
      checks,
    };
  }
}
