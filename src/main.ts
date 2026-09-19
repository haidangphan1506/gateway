import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@packages/interceptor/response.interceptor';
import { ErrorInterceptor, LoggerInterceptor } from '@packages/interceptor';
import { HttpExceptionFilter } from '@packages/filters';
import { ensureKafkaTopics } from './features/kafka/kafka.admin';
import { ALL_KAFKA_TOPICS } from './features/kafka/kafka.constants';
import { requestContextMiddleware } from '@packages/context/request-context.middleware';

async function bootstrap() {
  // Must run before `NestFactory.create()`: `KafkaModule`'s `KafkaProducer.onModuleInit()`
  // connects and subscribes as soon as the module tree is instantiated, so topics have to exist
  // before that point or the client races the broker's own auto-create.
  await ensureKafkaTopics(ALL_KAFKA_TOPICS);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // First in the chain: opens the AsyncLocalStorage context (correlationId/traceId/serviceName)
  // that every interceptor, guard, controller, and `KafkaProducer.send()` call below reads from.
  app.use(requestContextMiddleware);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ErrorInterceptor(), new LoggerInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Backends API')
    .setDescription('API documentation for the Backends financial management system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
      },
      'access-token',
    )
    // ── Tutor Management ─────────────────────────────
    .addTag('Users')
    .addTag('Auth')
    .addTag('Students')
    .addTag('Curriculum')
    .addTag('Chapter')
    .addTag('Lesson')
    .addTag('Classes')
    .addTag('Schedules')
    .addTag('Sessions')
    .addTag('Exercises')
    .addTag('Tuitions')
    .addTag('Notifications')
    // ── Finance Management ────────────────────────────
    .addTag('Categories')
    .addTag('Wallets')
    .addTag('Transactions')
    .addTag('Reports')
    // ── System ────────────────────────────────────────
    .addTag('Upload')
    .addTag('Cloudinary')
    .addTag('Health')
    .addTag('Redis')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 8888;
  await app.listen(port);
  Logger.log(`[GATEWAY] listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
