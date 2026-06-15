import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: process.env.SERVICE_NAME ?? 'auth-service',
      status: 'ok',
      port: Number(process.env.PORT ?? 3002),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      rabbitmqConfigured: Boolean(process.env.RABBITMQ_URL),
    };
  }
}
