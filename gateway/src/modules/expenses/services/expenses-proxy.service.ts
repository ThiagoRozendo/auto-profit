import { Injectable } from '@nestjs/common';
import { InternalHttpService } from '../../../common/http/internal-http.service';
import type { CreateExpenseDto } from '../dto/create-expense.dto';
import type { ExpenseCategory } from '../dto/expense-category.enum';
import type { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import type { UpdateExpenseDto } from '../dto/update-expense.dto';

function getExpenseServiceUrl(): string {
  return (
    process.env.EXPENSE_SERVICE_URL?.trim() ?? 'http://expense-service:3004'
  );
}

export interface ExpenseResponse {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel?: string | null;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseVehicleTotalResponse {
  vehicleId: string;
  totalExpenses: number;
  count: number;
}

@Injectable()
export class ExpensesProxyService {
  constructor(private readonly internalHttpService: InternalHttpService) {}

  create(
    dto: CreateExpenseDto,
    headers: Record<string, string>,
  ): Promise<ExpenseResponse> {
    return this.internalHttpService.post<ExpenseResponse>(
      `${getExpenseServiceUrl()}/expenses`,
      dto,
      headers,
    );
  }

  findAll(
    headers: Record<string, string>,
    query: ListExpensesQueryDto,
  ): Promise<ExpenseResponse[]> {
    const params = new URLSearchParams();

    if (query.vehicleId) params.append('vehicleId', query.vehicleId);
    if (query.category) params.append('category', query.category);
    if (query.search) params.append('search', query.search);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const qs = params.toString();
    const url = qs
      ? `${getExpenseServiceUrl()}/expenses?${qs}`
      : `${getExpenseServiceUrl()}/expenses`;

    return this.internalHttpService.get<ExpenseResponse[]>(url, headers);
  }

  findOne(id: string, headers: Record<string, string>): Promise<ExpenseResponse> {
    return this.internalHttpService.get<ExpenseResponse>(
      `${getExpenseServiceUrl()}/expenses/${id}`,
      headers,
    );
  }

  update(
    id: string,
    dto: UpdateExpenseDto,
    headers: Record<string, string>,
  ): Promise<ExpenseResponse> {
    return this.internalHttpService.patch<ExpenseResponse>(
      `${getExpenseServiceUrl()}/expenses/${id}`,
      dto,
      headers,
    );
  }

  remove(id: string, headers: Record<string, string>): Promise<void> {
    return this.internalHttpService.delete<void>(
      `${getExpenseServiceUrl()}/expenses/${id}`,
      headers,
    );
  }

  findByVehicle(
    vehicleId: string,
    headers: Record<string, string>,
  ): Promise<ExpenseResponse[]> {
    return this.internalHttpService.get<ExpenseResponse[]>(
      `${getExpenseServiceUrl()}/expenses/vehicle/${vehicleId}`,
      headers,
    );
  }

  getVehicleTotal(
    vehicleId: string,
    headers: Record<string, string>,
  ): Promise<ExpenseVehicleTotalResponse> {
    return this.internalHttpService.get<ExpenseVehicleTotalResponse>(
      `${getExpenseServiceUrl()}/expenses/vehicle/${vehicleId}/total`,
      headers,
    );
  }
}
