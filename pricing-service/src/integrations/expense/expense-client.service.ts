import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface VehicleExpensesTotalResponse {
  vehicleId: string;
  totalExpenses: number;
  count: number;
}

@Injectable()
export class ExpenseClientService {
  private readonly baseUrl = process.env.EXPENSE_SERVICE_URL ?? 'http://localhost:3004';

  async getVehicleTotal(
    vehicleId: string,
    userId: string,
  ): Promise<VehicleExpensesTotalResponse> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/expenses/vehicle/${vehicleId}/total`, {
        headers: { 'x-user-id': userId },
      });
    } catch {
      throw new ServiceUnavailableException('Expense Service indisponível');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('Expense Service indisponível');
    }

    return (await response.json()) as VehicleExpensesTotalResponse;
  }
}
