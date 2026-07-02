import { Injectable } from '@nestjs/common';
import { type PricingCalculation, type PricingRule } from '../../../generated/prisma/client';
import { ExpenseClientService } from '../../../integrations/expense/expense-client.service';
import {
  VehicleClientService,
  type VehicleResponse,
} from '../../../integrations/vehicle/vehicle-client.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CalculatePricingDto } from '../dto/calculate-pricing.dto';
import { UpdatePricingRuleDto } from '../dto/update-pricing-rule.dto';

export type PricingRuleResponse = Omit<PricingRule, 'defaultProfitMargin'> & {
  defaultProfitMargin: number;
};

export type PricingCalculationResponse = Omit<
  PricingCalculation,
  | 'purchasePriceSnapshot'
  | 'totalExpensesSnapshot'
  | 'totalInvestment'
  | 'profitMargin'
  | 'suggestedPrice'
  | 'expectedProfit'
> & {
  purchasePriceSnapshot: number;
  totalExpensesSnapshot: number;
  totalInvestment: number;
  profitMargin: number;
  suggestedPrice: number;
  expectedProfit: number;
};

export interface PricingResult {
  vehicleId: string;
  vehicleLabel: string;
  purchasePrice: number;
  totalExpenses: number;
  totalInvestment: number;
  profitMargin: number;
  expectedProfit: number;
  suggestedPrice: number;
  saved: boolean;
  calculationId?: string;
}

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehicleClient: VehicleClientService,
    private readonly expenseClient: ExpenseClientService,
  ) {}

  private serializeRule(rule: PricingRule): PricingRuleResponse {
    return {
      ...rule,
      defaultProfitMargin: Number(rule.defaultProfitMargin),
    };
  }

  private serializeCalculation(
    calculation: PricingCalculation,
  ): PricingCalculationResponse {
    return {
      ...calculation,
      purchasePriceSnapshot: Number(calculation.purchasePriceSnapshot),
      totalExpensesSnapshot: Number(calculation.totalExpensesSnapshot),
      totalInvestment: Number(calculation.totalInvestment),
      profitMargin: Number(calculation.profitMargin),
      suggestedPrice: Number(calculation.suggestedPrice),
      expectedProfit: Number(calculation.expectedProfit),
    };
  }

  async getRule(userId: string): Promise<PricingRuleResponse> {
    const rule = await this.prisma.pricingRule.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return this.serializeRule(rule);
  }

  async updateRule(
    userId: string,
    dto: UpdatePricingRuleDto,
  ): Promise<PricingRuleResponse> {
    const rule = await this.prisma.pricingRule.upsert({
      where: { userId },
      create: {
        userId,
        defaultProfitMargin: dto.defaultProfitMargin,
      },
      update: {
        defaultProfitMargin: dto.defaultProfitMargin,
      },
    });

    return this.serializeRule(rule);
  }

  async previewByVehicle(
    userId: string,
    vehicleId: string,
    margin?: number,
  ): Promise<PricingResult> {
    return this.calculateForVehicle(userId, vehicleId, margin, false);
  }

  async calculate(userId: string, dto: CalculatePricingDto): Promise<PricingResult> {
    return this.calculateForVehicle(
      userId,
      dto.vehicleId,
      dto.profitMargin,
      dto.saveHistory ?? true,
    );
  }

  async listHistory(userId: string): Promise<PricingCalculationResponse[]> {
    const calculations = await this.prisma.pricingCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return calculations.map((calculation) => this.serializeCalculation(calculation));
  }

  async listHistoryByVehicle(
    userId: string,
    vehicleId: string,
  ): Promise<PricingCalculationResponse[]> {
    const calculations = await this.prisma.pricingCalculation.findMany({
      where: { userId, vehicleId },
      orderBy: { createdAt: 'desc' },
    });

    return calculations.map((calculation) => this.serializeCalculation(calculation));
  }

  private async calculateForVehicle(
    userId: string,
    vehicleId: string,
    margin: number | undefined,
    saveHistory: boolean,
  ): Promise<PricingResult> {
    const [vehicle, expenses] = await Promise.all([
      this.vehicleClient.findById(vehicleId, userId),
      this.expenseClient.getVehicleTotal(vehicleId, userId),
    ]);
    const profitMargin = margin ?? (await this.getDefaultMargin(userId));

    const purchasePrice = Number(vehicle.purchasePrice);
    const totalExpenses = Number(expenses.totalExpenses);
    const totalInvestment = purchasePrice + totalExpenses;
    const expectedProfit = (totalInvestment * profitMargin) / 100;
    const suggestedPrice = totalInvestment + expectedProfit;

    const result: PricingResult = {
      vehicleId: vehicle.id,
      vehicleLabel: this.vehicleLabel(vehicle),
      purchasePrice,
      totalExpenses,
      totalInvestment,
      profitMargin,
      expectedProfit,
      suggestedPrice,
      saved: false,
    };

    if (!saveHistory) {
      return result;
    }

    const calculation = await this.prisma.pricingCalculation.create({
      data: {
        userId,
        vehicleId: vehicle.id,
        purchasePriceSnapshot: purchasePrice,
        totalExpensesSnapshot: totalExpenses,
        totalInvestment,
        profitMargin,
        suggestedPrice,
        expectedProfit,
      },
    });

    return {
      ...result,
      saved: true,
      calculationId: calculation.id,
    };
  }

  private async getDefaultMargin(userId: string): Promise<number> {
    const rule = await this.getRule(userId);
    return rule.defaultProfitMargin;
  }

  private vehicleLabel(vehicle: VehicleResponse): string {
    return `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
  }
}
