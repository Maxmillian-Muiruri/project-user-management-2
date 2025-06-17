// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Updated CORS configuration to include multiple origins
  app.enableCors({
    origin: [
      'http://127.0.0.1:5500', // Your original Live Server
      'http://localhost:5500', // Alternative localhost format
      'http://localhost:3003', // Your current frontend port
      'http://localhost:8080', // Common dev server port
      'http://127.0.0.1:3003', // Alternative format for 3003
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  // Serve static files from public directory
  app.use(express.static(join(__dirname, '..', 'public')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000, '0.0.0.0'); // Listen on all network interfaces
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log('CORS enabled for origins:', [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3003',
    'http://localhost:8080',
    'http://127.0.0.1:3003',
  ]);
}
bootstrap();
