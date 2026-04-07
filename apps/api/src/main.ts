import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      configService.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      configService.get('NEXT_PUBLIC_PORTAL_URL', 'http://localhost:3001'),
      configService.get('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3002'),
    ],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MyFundingTrade API')
    .setDescription('Backend API for the MyFundingTrade prop trading platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('API_PORT', 4000);
  const host = configService.get('API_HOST', '0.0.0.0');
  await app.listen(port, host);

  console.log(`🚀 API running on http://${host}:${port}`);
  console.log(`📚 Swagger docs at http://${host}:${port}/api/docs`);
}

bootstrap();
