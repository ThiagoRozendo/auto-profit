import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: process.env.SERVICE_NAME ?? 'vehicle-service',
      status: 'ok',
      port: Number(process.env.PORT ?? 3003),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      rabbitmqConfigured: Boolean(process.env.RABBITMQ_URL),
    };
  }
}
