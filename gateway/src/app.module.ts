import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyModule } from './modules/auth-proxy/auth-proxy.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [AuthProxyModule, VehiclesModule, ExpensesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule {}
