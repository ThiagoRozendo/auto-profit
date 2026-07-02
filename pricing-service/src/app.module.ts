import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PricingModule } from './modules/pricing/pricing.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, PricingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
