import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ExpenseCategory,
  Prisma,
  type Expense,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

type ExpenseResponse = Omit<Expense, 'amount'> & {
  amount: number;
};

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(expense: Expense): ExpenseResponse {
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  /**
   * Retorna a despesa se existir e pertencer ao usuário.
   * Lança NotFoundException caso contrário, sem expor dados de outro usuário.
   */
  private async findOwnedOrFail(id: string, userId: string): Promise<Expense> {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return expense;
  }

  async create(userId: string, dto: CreateExpenseDto): Promise<ExpenseResponse> {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        vehicleId: dto.vehicleId,
        vehicleLabel: dto.vehicleLabel ?? null,
        description: dto.description,
        category: dto.category ?? ExpenseCategory.OTHER,
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      },
    });

    return this.serialize(expense);
  }

  async findAll(
    userId: string,
    query: ListExpensesQueryDto,
  ): Promise<ExpenseResponse[]> {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { description: { contains: term, mode: 'insensitive' } },
        { vehicleLabel: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      const expenseDate: Prisma.DateTimeFilter = {};

      if (query.startDate) {
        expenseDate.gte = new Date(query.startDate);
      }

      if (query.endDate) {
        expenseDate.lte = new Date(query.endDate);
      }

      where.expenseDate = expenseDate;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    return expenses.map((expense) => this.serialize(expense));
  }

  async findOne(id: string, userId: string): Promise<ExpenseResponse> {
    const expense = await this.findOwnedOrFail(id, userId);
    return this.serialize(expense);
  }

  async update(
    id: string,
    dto: UpdateExpenseDto,
    userId: string,
  ): Promise<ExpenseResponse> {
    await this.findOwnedOrFail(id, userId);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.vehicleId !== undefined && { vehicleId: dto.vehicleId }),
        ...(dto.vehicleLabel !== undefined && { vehicleLabel: dto.vehicleLabel }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.expenseDate !== undefined && {
          expenseDate: new Date(dto.expenseDate),
        }),
      },
    });

    return this.serialize(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwnedOrFail(id, userId);
    await this.prisma.expense.delete({ where: { id } });
  }

  async findByVehicle(
    vehicleId: string,
    userId: string,
  ): Promise<ExpenseResponse[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId, userId },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    return expenses.map((expense) => this.serialize(expense));
  }

  async getVehicleTotal(vehicleId: string, userId: string) {
    const aggregate = await this.prisma.expense.aggregate({
      where: { vehicleId, userId },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      vehicleId,
      totalExpenses:
        aggregate._sum.amount != null ? Number(aggregate._sum.amount) : 0,
      count: aggregate._count.id,
    };
  }
}
