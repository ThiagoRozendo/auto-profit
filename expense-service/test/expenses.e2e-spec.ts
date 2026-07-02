import { randomUUID } from 'node:crypto';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import {
  Catch,
  HttpException,
  NotFoundException,
  ValidationPipe,
  type ArgumentsHost,
  type ExceptionFilter,
  type INestApplication,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ExpenseCategory } from '../src/generated/prisma/client';
import { setupApiDocs } from '../src/docs/api-docs';
import { PrismaService } from '../src/prisma/prisma.service';

interface StoredExpense {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleLabel: string | null;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Catch()
class TestLoggingFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = resolveStatusCode(exception);
    const payload = resolveErrorPayload(exception, status);

    response.status(status).json({
      ...payload,
      statusCode: status,
    });
  }
}

function resolveStatusCode(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  if (
    typeof exception === 'object' &&
    exception !== null &&
    'status' in exception &&
    typeof exception.status === 'number'
  ) {
    return exception.status;
  }

  return 500;
}

function resolveErrorPayload(
  exception: unknown,
  statusCode: number,
): { message: string | string[]; error?: string } {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response };
    }

    if (typeof response === 'object' && response !== null) {
      const payload = response as { message?: string | string[]; error?: string };

      return {
        message: payload.message ?? exception.message,
        error: payload.error,
      };
    }
  }

  if (exception instanceof Error) {
    return { message: exception.message };
  }

  return {
    message: statusCode === 500 ? 'Internal server error' : 'Unexpected error',
  };
}

class FakePrismaService {
  private expenses = new Map<string, StoredExpense>();

  readonly expense = {
    findFirst: ({
      where,
    }: {
      where: { id?: string; userId?: string };
    }): Promise<StoredExpense | null> => {
      const found =
        Array.from(this.expenses.values()).find((expense) => {
          if (where.id && expense.id !== where.id) {
            return false;
          }

          if (where.userId && expense.userId !== where.userId) {
            return false;
          }

          return true;
        }) ?? null;

      return Promise.resolve(found);
    },

    create: ({
      data,
    }: {
      data: {
        userId: string;
        vehicleId: string;
        vehicleLabel: string | null;
        description: string;
        category: ExpenseCategory;
        amount: number;
        expenseDate: Date;
      };
    }): Promise<StoredExpense> => {
      const now = new Date();
      const expense: StoredExpense = {
        id: randomUUID(),
        userId: data.userId,
        vehicleId: data.vehicleId,
        vehicleLabel: data.vehicleLabel,
        description: data.description,
        category: data.category,
        amount: data.amount,
        expenseDate: new Date(data.expenseDate),
        createdAt: now,
        updatedAt: now,
      };

      this.expenses.set(expense.id, expense);
      return Promise.resolve(expense);
    },

    findMany: ({
      where,
    }: {
      where?: {
        userId?: string;
        vehicleId?: string;
        category?: ExpenseCategory;
        OR?: Array<{
          description?: { contains: string; mode: string };
          vehicleLabel?: { contains: string; mode: string };
        }>;
        expenseDate?: { gte?: Date; lte?: Date };
      };
      orderBy?: Array<Record<string, 'asc' | 'desc'>>;
    }): Promise<StoredExpense[]> => {
      const expenses = Array.from(this.expenses.values())
        .filter((expense) => this.matchesWhere(expense, where))
        .sort((left, right) => {
          const expenseDateOrder =
            right.expenseDate.getTime() - left.expenseDate.getTime();

          if (expenseDateOrder !== 0) {
            return expenseDateOrder;
          }

          return right.createdAt.getTime() - left.createdAt.getTime();
        });

      return Promise.resolve(expenses);
    },

    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: {
        vehicleId?: string;
        vehicleLabel?: string | null;
        description?: string;
        category?: ExpenseCategory;
        amount?: number;
        expenseDate?: Date;
      };
    }): Promise<StoredExpense> => {
      const current = this.expenses.get(where.id);

      if (!current) {
        return Promise.reject(new NotFoundException('Despesa não encontrada'));
      }

      const updated: StoredExpense = {
        ...current,
        ...data,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : current.expenseDate,
        updatedAt: new Date(),
      };

      this.expenses.set(updated.id, updated);
      return Promise.resolve(updated);
    },

    delete: ({
      where,
    }: {
      where: { id: string };
    }): Promise<StoredExpense> => {
      const current = this.expenses.get(where.id);

      if (!current) {
        return Promise.reject(new NotFoundException('Despesa não encontrada'));
      }

      this.expenses.delete(where.id);
      return Promise.resolve(current);
    },

    aggregate: ({
      where,
    }: {
      where: { vehicleId: string; userId: string };
      _sum: { amount: true };
      _count: { id: true };
    }): Promise<{ _sum: { amount: number | null }; _count: { id: number } }> => {
      const expenses = Array.from(this.expenses.values()).filter(
        (expense) =>
          expense.vehicleId === where.vehicleId && expense.userId === where.userId,
      );

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      return Promise.resolve({
        _sum: { amount: expenses.length > 0 ? total : null },
        _count: { id: expenses.length },
      });
    },
  };

  reset(): void {
    this.expenses.clear();
  }

  seed(overrides: Partial<StoredExpense> = {}): StoredExpense {
    const now = new Date();
    const expense: StoredExpense = {
      id: overrides.id ?? randomUUID(),
      userId: overrides.userId ?? TEST_USER_ID,
      vehicleId: overrides.vehicleId ?? TEST_VEHICLE_ID,
      vehicleLabel: overrides.vehicleLabel ?? 'Honda Civic 2020',
      description: overrides.description ?? 'Troca de pneus',
      category: overrides.category ?? ExpenseCategory.MAINTENANCE,
      amount: overrides.amount ?? 1800,
      expenseDate: overrides.expenseDate ?? new Date('2026-06-25T10:00:00.000Z'),
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
    };

    this.expenses.set(expense.id, expense);
    return expense;
  }

  private matchesWhere(
    expense: StoredExpense,
    where?: {
      userId?: string;
      vehicleId?: string;
      category?: ExpenseCategory;
      OR?: Array<{
        description?: { contains: string; mode: string };
        vehicleLabel?: { contains: string; mode: string };
      }>;
      expenseDate?: { gte?: Date; lte?: Date };
    },
  ): boolean {
    if (!where) {
      return true;
    }

    if (where.userId && expense.userId !== where.userId) {
      return false;
    }

    if (where.vehicleId && expense.vehicleId !== where.vehicleId) {
      return false;
    }

    if (where.category && expense.category !== where.category) {
      return false;
    }

    if (where.expenseDate?.gte && expense.expenseDate < where.expenseDate.gte) {
      return false;
    }

    if (where.expenseDate?.lte && expense.expenseDate > where.expenseDate.lte) {
      return false;
    }

    if (where.OR?.length) {
      return where.OR.some((clause) => {
        const descriptionTerm = clause.description?.contains?.toLowerCase();
        const vehicleLabelTerm = clause.vehicleLabel?.contains?.toLowerCase();

        if (descriptionTerm) {
          return expense.description.toLowerCase().includes(descriptionTerm);
        }

        if (vehicleLabelTerm) {
          return expense.vehicleLabel?.toLowerCase().includes(vehicleLabelTerm) ?? false;
        }

        return false;
      });
    }

    return true;
  }
}

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = '99999999-9999-4999-8999-999999999999';
const TEST_VEHICLE_ID = '22222222-2222-4222-8222-222222222222';
const OTHER_VEHICLE_ID = '33333333-3333-4333-8333-333333333333';

function authHeaders(userId = TEST_USER_ID): Record<string, string> {
  return {
    'x-user-id': userId,
    'x-user-email': 'joao.silva@example.com',
    'x-user-role': 'SELLER',
  };
}

describe('ExpensesController (e2e)', () => {
  let app: INestApplication;
  let fakePrisma: FakePrismaService;

  beforeAll(async () => {
    process.env.SWAGGER_DOCS = 'true';
    process.env.API_DOCS_UI = 'swagger';
    process.env.SERVICE_NAME = 'expense-service';

    fakePrisma = new FakePrismaService();
    const { AppModule } = await import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new TestLoggingFilter());
    setupApiDocs(app);
    await app.init();
  });

  afterEach(() => {
    fakePrisma.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api-json should expose the Expenses tag and expense routes', async () => {
    const response = await request(app.getHttpServer()).get('/api-json').expect(200);

    expect(response.body.paths).toEqual(
      expect.objectContaining({
        '/expenses': expect.objectContaining({
          post: expect.objectContaining({
            summary: 'Cadastrar despesa',
            tags: ['Expenses'],
          }),
          get: expect.objectContaining({
            summary: 'Listar despesas',
            tags: ['Expenses'],
          }),
        }),
      }),
    );
  });

  it('POST /expenses should create an expense for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set(authHeaders())
      .send({
        vehicleId: TEST_VEHICLE_ID,
        vehicleLabel: 'Honda Civic 2020',
        description: 'Troca de pneus',
        amount: 1800,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        userId: TEST_USER_ID,
        vehicleId: TEST_VEHICLE_ID,
        vehicleLabel: 'Honda Civic 2020',
        description: 'Troca de pneus',
        category: 'OTHER',
        amount: 1800,
      }),
    );
    expect(response.body.expenseDate).toEqual(expect.any(String));
  });

  it('GET /expenses should apply filters by vehicle, category, search and date range', async () => {
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      description: 'Troca de pneus dianteiros',
      category: ExpenseCategory.MAINTENANCE,
      amount: 900,
      expenseDate: new Date('2026-06-10T10:00:00.000Z'),
    });
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      description: 'Seguro anual',
      category: ExpenseCategory.DOCUMENTATION,
      amount: 1200,
      expenseDate: new Date('2026-06-15T10:00:00.000Z'),
    });
    fakePrisma.seed({
      userId: TEST_USER_ID,
      vehicleId: OTHER_VEHICLE_ID,
      description: 'Lavagem',
      category: ExpenseCategory.CLEANING,
      amount: 100,
      expenseDate: new Date('2026-06-12T10:00:00.000Z'),
    });

    const response = await request(app.getHttpServer())
      .get('/expenses')
      .set(authHeaders())
      .query({
        vehicleId: TEST_VEHICLE_ID,
        category: ExpenseCategory.MAINTENANCE,
        search: 'pneus',
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-30T23:59:59.999Z',
      })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        vehicleId: TEST_VEHICLE_ID,
        description: 'Troca de pneus dianteiros',
        category: 'MAINTENANCE',
        amount: 900,
      }),
    );
  });

  it('GET /expenses/:id should return 404 for expenses from another user', async () => {
    const expense = fakePrisma.seed({
      userId: OTHER_USER_ID,
      vehicleId: OTHER_VEHICLE_ID,
    });

    const response = await request(app.getHttpServer())
      .get(`/expenses/${expense.id}`)
      .set(authHeaders())
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Despesa não encontrada',
      error: 'Not Found',
    });
  });

  it('PATCH /expenses/:id should update only the informed fields', async () => {
    const expense = fakePrisma.seed({
      description: 'Troca de pneus',
      amount: 1800,
      category: ExpenseCategory.MAINTENANCE,
    });

    const response = await request(app.getHttpServer())
      .patch(`/expenses/${expense.id}`)
      .set(authHeaders())
      .send({
        description: 'Troca de pneus e alinhamento',
        amount: 2100,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expense.id,
        description: 'Troca de pneus e alinhamento',
        amount: 2100,
        category: 'MAINTENANCE',
      }),
    );
  });

  it('DELETE /expenses/:id should remove the expense', async () => {
    const expense = fakePrisma.seed();

    await request(app.getHttpServer())
      .delete(`/expenses/${expense.id}`)
      .set(authHeaders())
      .expect(204);

    await request(app.getHttpServer())
      .get(`/expenses/${expense.id}`)
      .set(authHeaders())
      .expect(404);
  });

  it('GET /expenses/vehicle/:vehicleId should return only expenses for the requested vehicle', async () => {
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      description: 'Troca de óleo',
      amount: 250,
    });
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      description: 'Alinhamento',
      amount: 150,
    });
    fakePrisma.seed({
      vehicleId: OTHER_VEHICLE_ID,
      description: 'Documentação',
      amount: 300,
    });

    const response = await request(app.getHttpServer())
      .get(`/expenses/vehicle/${TEST_VEHICLE_ID}`)
      .set(authHeaders())
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body.map((expense: { vehicleId: string }) => expense.vehicleId)).toEqual([
      TEST_VEHICLE_ID,
      TEST_VEHICLE_ID,
    ]);
  });

  it('GET /expenses/vehicle/:vehicleId/total should return the expense sum and count', async () => {
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      amount: 1200,
    });
    fakePrisma.seed({
      vehicleId: TEST_VEHICLE_ID,
      amount: 800,
    });
    fakePrisma.seed({
      vehicleId: OTHER_VEHICLE_ID,
      amount: 400,
    });

    const response = await request(app.getHttpServer())
      .get(`/expenses/vehicle/${TEST_VEHICLE_ID}/total`)
      .set(authHeaders())
      .expect(200);

    expect(response.body).toEqual({
      vehicleId: TEST_VEHICLE_ID,
      totalExpenses: 2000,
      count: 2,
    });
  });

  it('POST /expenses should reject invalid payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set(authHeaders())
      .send({
        vehicleId: 'invalid-uuid',
        description: '',
        category: 'INVALID_CATEGORY',
        amount: -10,
        expenseDate: 'invalid-date',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'vehicleId deve ser um UUID válido',
        'A descrição é obrigatória',
        'Categoria inválida',
        'O valor não pode ser negativo',
        'expenseDate deve ser uma data ISO 8601 válida',
      ]),
    );
  });

  it('GET /expenses should require the internal user header', async () => {
    const response = await request(app.getHttpServer()).get('/expenses').expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Usuário autenticado não informado',
      error: 'Unauthorized',
    });
  });
});
