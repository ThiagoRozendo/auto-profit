import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  InternalUser,
  InternalUser as IUser,
} from '../../../common/decorators/internal-user.decorator';
import { CalculatePricingDto } from '../dto/calculate-pricing.dto';
import { UpdatePricingRuleDto } from '../dto/update-pricing-rule.dto';
import { PricingService } from '../services/pricing.service';
import {
  CalculatePricingApiDocs,
  GetPricingRuleApiDocs,
  ListPricingHistoryApiDocs,
  ListPricingHistoryByVehicleApiDocs,
  PreviewPricingByVehicleApiDocs,
  PricingApiTags,
  UpdatePricingRuleApiDocs,
} from '../swagger';

@PricingApiTags()
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('rules')
  @GetPricingRuleApiDocs()
  getRule(@InternalUser() user: IUser) {
    return this.pricingService.getRule(user.id);
  }

  @Patch('rules')
  @UpdatePricingRuleApiDocs()
  updateRule(@InternalUser() user: IUser, @Body() dto: UpdatePricingRuleDto) {
    return this.pricingService.updateRule(user.id, dto);
  }

  @Get('vehicles/:vehicleId')
  @PreviewPricingByVehicleApiDocs()
  previewByVehicle(
    @InternalUser() user: IUser,
    @Param('vehicleId') vehicleId: string,
    @Query('margin') margin?: string,
  ) {
    return this.pricingService.previewByVehicle(
      user.id,
      vehicleId,
      this.parseMargin(margin),
    );
  }

  @Post('calculate')
  @CalculatePricingApiDocs()
  calculate(@InternalUser() user: IUser, @Body() dto: CalculatePricingDto) {
    return this.pricingService.calculate(user.id, dto);
  }

  @Get('history')
  @ListPricingHistoryApiDocs()
  listHistory(@InternalUser() user: IUser) {
    return this.pricingService.listHistory(user.id);
  }

  @Get('history/:vehicleId')
  @ListPricingHistoryByVehicleApiDocs()
  listHistoryByVehicle(
    @InternalUser() user: IUser,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.pricingService.listHistoryByVehicle(user.id, vehicleId);
  }

  private parseMargin(margin?: string): number | undefined {
    if (margin === undefined) {
      return undefined;
    }

    const parsed = Number(margin);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException('Margem de lucro inválida');
    }

    return parsed;
  }
}
