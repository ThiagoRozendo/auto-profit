import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApiDocs } from './docs/api-docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApiDocs(app);
  await app.listen(process.env.PORT ?? 3005);
}

void bootstrap();
