import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';
import { VaultService } from './infra/oci/vault.service';

async function bootstrap() {
  // 1. Load Secrets from OCI Vault (Runtime Injection)
  const logger = new Logger('Bootstrap');
  try {
    const vaultService = new VaultService();
    await vaultService.loadSecrets();
  } catch (error) {
    logger.warn('Failed to load OCI secrets (VaultService). Continuing with local env...', error);
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Trust proxy for correct IP resolution behind reverse proxies (Nginx, Cloudflare, etc.)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  app.use(cookieParser());
  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Uirá Payments API')
    .setDescription('The Uirá Payments API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS with Credentials for Frontend
  const configService = app.get(ConfigService);
  const domain = configService.get<string>('DOMAIN');
  const frontendUrl = domain ? `https://${domain}` : null;
  app.enableCors({
    origin: frontendUrl || 'http://localhost:3001',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
