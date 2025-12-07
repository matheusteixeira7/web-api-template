import 'dotenv/config';

import cookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  await app.register(cookie);

  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: process.env.FRONTEND_URL || (isDevelopment && 'http://localhost:3000'),
    credentials: true,
  });

  await app.listen(3333, '0.0.0.0');
}

void bootstrap();
