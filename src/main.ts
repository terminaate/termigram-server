import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('/api', {
    exclude: [{ path: '/static', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

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
