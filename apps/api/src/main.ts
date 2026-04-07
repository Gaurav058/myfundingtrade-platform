import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    rawBody: true, // required for Stripe webhook signature verification
  });
  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // ── Trust proxy (required behind ALB / Nginx / Cloudflare) ──
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');

  // ── Helmet — hardened security headers ──
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction,
      crossOriginOpenerPolicy: isProduction ? { policy: 'same-origin' } : false,
      crossOriginResourcePolicy: isProduction ? { policy: 'same-origin' } : false,
      hsts: isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    }),
  );

  // ── Cookie parser (signed cookies for refresh tokens) ──
  app.use(cookieParser(configService.get('COOKIE_SECRET', '')));

  // ── CORS — strict origin validation ──
  const allowedOrigins = buildAllowedOrigins(configService);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / mobile
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(`CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  });

  // ── Global validation ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      disableErrorMessages: isProduction,
    }),
  );

  // ── API prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Swagger (disabled in production) ──
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MyFundingTrade API')
      .setDescription('Backend API for the MyFundingTrade prop trading platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('API_PORT', 4000);
  const host = configService.get('API_HOST', '0.0.0.0');
  await app.listen(port, host);

  logger.log(`API running on http://${host}:${port} [${configService.get('NODE_ENV', 'development')}]`);
  if (!isProduction) logger.log(`Swagger docs at http://${host}:${port}/api/docs`);
}

function buildAllowedOrigins(configService: ConfigService): string[] {
  const origins = new Set<string>();

  const explicit = configService.get<string>('ALLOWED_ORIGINS', '');
  if (explicit) {
    explicit.split(',').map((o) => o.trim()).filter(Boolean).forEach((o) => origins.add(o));
  }

  for (const key of ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_PORTAL_URL', 'NEXT_PUBLIC_ADMIN_URL']) {
    const url = configService.get<string>(key);
    if (url) origins.add(url);
  }

  if (origins.size === 0) {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:3001');
    origins.add('http://localhost:3002');
  }

  return Array.from(origins);
}

bootstrap();
