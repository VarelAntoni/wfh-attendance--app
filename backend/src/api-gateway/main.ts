import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { GatewayModule } from './gateway.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // Enable CORS for frontend client
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve static files for uploaded WFH photos
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(` [ApiGateway] HTTP REST API listening on http://localhost:${port}`);
  console.log(` [ApiGateway] Uploaded static photos served at http://localhost:${port}/uploads`);
}

bootstrap();
