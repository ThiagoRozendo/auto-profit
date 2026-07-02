import 'dotenv/config';
import 'reflect-metadata';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  ValidationPipe,
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

    const status = resolveStatusCode(exception);
    const payload = resolveErrorPayload(exception, status);

    response.status(status).json({
      ...payload,
      statusCode: status,
    });
  }
}

function resolveStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  if (
    typeof exception === 'object' &&
    exception !== null &&
    'status' in exception &&
    typeof exception.status === 'number'
  ) {
    return exception.status;
  }

  return 500;
}

function resolveErrorPayload(
  exception: unknown,
  statusCode: number,
): { message: string | string[]; error?: string } {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response };
    }

    if (typeof response === 'object' && response !== null) {
      const payload = response as { message?: string | string[]; error?: string };

      return {
        message: payload.message ?? exception.message,
        error: payload.error,
      };
    }
  }

  if (exception instanceof Error) {
    return { message: exception.message };
  }

  return {
    message: statusCode === 500 ? 'Internal server error' : 'Unexpected error',
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new LoggingFilter());
  setupApiDocs(app);
  await app.listen(process.env.PORT ?? 3005);
}

void bootstrap();
