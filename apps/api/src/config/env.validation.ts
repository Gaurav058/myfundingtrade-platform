import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export function validate(config: Record<string, unknown>): Record<string, unknown> {
  const isProduction = config.NODE_ENV === 'production';
  const errors: string[] = [];

  // --- Always required ---
  if (!config.DATABASE_URL) errors.push('DATABASE_URL is required');
  if (!config.JWT_SECRET) {
    if (isProduction) {
      errors.push('JWT_SECRET is required');
    } else {
      logger.warn('JWT_SECRET not set — using insecure default. DO NOT use in production.');
    }
  }

  // --- Production-only ---
  if (isProduction) {
    if (!config.REDIS_URL) errors.push('REDIS_URL is required in production');

    const jwtSecret = config.JWT_SECRET as string;
    if (jwtSecret && jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
    if (jwtSecret === 'dev-secret-change-me') {
      errors.push('JWT_SECRET must not be the default value in production');
    }

    if (!config.COOKIE_SECRET) errors.push('COOKIE_SECRET is required in production');

    const hasOrigins =
      config.ALLOWED_ORIGINS || config.NEXT_PUBLIC_APP_URL;
    if (!hasOrigins) {
      errors.push('ALLOWED_ORIGINS or NEXT_PUBLIC_APP_URL must be set in production');
    }

    if (!config.STRIPE_SECRET_KEY) errors.push('STRIPE_SECRET_KEY is required in production');
    if (!config.STRIPE_WEBHOOK_SECRET) errors.push('STRIPE_WEBHOOK_SECRET is required in production');
    if (!config.RESEND_API_KEY) errors.push('RESEND_API_KEY is required in production');
  }

  // --- Abort in production, warn in dev ---
  if (errors.length > 0) {
    const message = `Environment validation failed:\n  - ${errors.join('\n  - ')}`;
    if (isProduction) throw new Error(message);
    logger.warn(message);
  }

  return config;
}
