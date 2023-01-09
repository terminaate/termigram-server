import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      credentials: true,
      origin: process.env.CLIENT_URL,
    },
  });

  app.setGlobalPrefix('/api', {
    exclude: [{ path: '/static', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(csurf());

  await app
    .listen(PORT)
    .then(() => console.log(`Listening on http://127.0.0.1:${PORT}`));
}

void bootstrap();
