import { Module } from '@nestjs/common';
import { ExpenseClientService } from '../../integrations/expense/expense-client.service';
import { VehicleClientService } from '../../integrations/vehicle/vehicle-client.service';
import { PricingController } from './controllers/pricing.controller';
import { PricingService } from './services/pricing.service';

@Module({
  controllers: [PricingController],
  providers: [PricingService, VehicleClientService, ExpenseClientService],
})
export class PricingModule {}
