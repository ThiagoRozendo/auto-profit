import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── helpers ────────────────────────────────────────────────────────────────

  /** Converte campos Decimal do Prisma para Number, tornando o JSON amigável ao frontend. */
  private serialize(expense: Record<string, unknown>): Record<string, unknown> {
    return {
      ...expense,
      amount: expense.amount != null ? Number(expense.amount) : null,
    };
  }

  /**
   * Retorna a despesa se existir e pertencer ao usuário.
   * Lança NotFoundException caso contrário — sem expor dados de outro usuário.
   */
  private async findOwnedOrFail(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return expense;
  }

  // ─── public methods ──────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        vehicleId: dto.vehicleId,
        vehicleLabel: dto.vehicleLabel ?? null,
        description: dto.description,
        category: dto.category,
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      },
    });

    return this.serialize(expense as unknown as Record<string, unknown>);
  }

  async findAll(userId: string, query: ListExpensesQueryDto) {
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
      where.expenseDate = {};
      if (query.startDate) {
        (where.expenseDate as Prisma.DateTimeFilter).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.expenseDate as Prisma.DateTimeFilter).lte = new Date(query.endDate);
      }
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    return expenses.map((e) =>
      this.serialize(e as unknown as Record<string, unknown>),
    );
  }

  async findOne(id: string, userId: string) {
    const expense = await this.findOwnedOrFail(id, userId);
    return this.serialize(expense as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
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

    return this.serialize(expense as unknown as Record<string, unknown>);
  }

  async remove(id: string, userId: string) {
    await this.findOwnedOrFail(id, userId);
    await this.prisma.expense.delete({ where: { id } });
  }

  async findByVehicle(vehicleId: string, userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId, userId },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });

    return expenses.map((e) =>
      this.serialize(e as unknown as Record<string, unknown>),
    );
  }

  async getVehicleTotal(vehicleId: string, userId: string) {
    const aggregate = await this.prisma.expense.aggregate({
      where: { vehicleId, userId },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      vehicleId,
      totalExpenses: aggregate._sum.amount != null ? Number(aggregate._sum.amount) : 0,
      count: aggregate._count.id,
    };
  }
}
