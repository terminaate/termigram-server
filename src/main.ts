import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // TODO
  // Find alternative to this package
  // app.use(csurf({}));

  const config = new DocumentBuilder()
    .setTitle('Termigram REST API')
    .setDescription('This is documentation of Termigram API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app
    .listen(PORT)
    .then(() => console.log(`Listening on http://127.0.0.1:${PORT}`));
}

void bootstrap();
