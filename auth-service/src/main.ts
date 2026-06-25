import 'dotenv/config';
import 'reflect-metadata';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApiDocs } from './docs/api-docs';

@Catch()
class LoggingFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<import('express').Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new LoggingFilter());
  setupApiDocs(app);
  await app.listen(process.env.PORT ?? 3002);
}

void bootstrap();
