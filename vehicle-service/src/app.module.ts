import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [PrismaModule, VehiclesModule],
})
export class AppModule {}
