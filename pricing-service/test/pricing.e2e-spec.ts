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
  ServiceUnavailableException,
  ValidationPipe,
  type ArgumentsHost,
  type ExceptionFilter,
  type INestApplication,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { setupApiDocs } from '../src/docs/api-docs';
import { ExpenseClientService } from '../src/integrations/expense/expense-client.service';
import {
  VehicleClientService,
  type VehicleResponse,
} from '../src/integrations/vehicle/vehicle-client.service';
import { PrismaService } from '../src/prisma/prisma.service';

interface StoredPricingRule {
  id: string;
  userId: string;
  defaultProfitMargin: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredPricingCalculation {
  id: string;
  userId: string;
  vehicleId: string;
  purchasePriceSnapshot: number;
  totalExpensesSnapshot: number;
  totalInvestment: number;
  profitMargin: number;
  suggestedPrice: number;
  expectedProfit: number;
  createdAt: Date;
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
  readonly rules = new Map<string, StoredPricingRule>();
  readonly calculations = new Map<string, StoredPricingCalculation>();

  readonly pricingRule = {
    upsert: ({
      where,
      create,
      update,
    }: {
      where: { userId: string };
      create: { userId: string; defaultProfitMargin?: number };
      update: { defaultProfitMargin?: number };
    }): Promise<StoredPricingRule> => {
      const current = this.rules.get(where.userId);

      if (current) {
        const updated: StoredPricingRule = {
          ...current,
          ...(update.defaultProfitMargin !== undefined && {
            defaultProfitMargin: update.defaultProfitMargin,
          }),
          updatedAt: new Date(),
        };
        this.rules.set(where.userId, updated);
        return Promise.resolve(updated);
      }

      const now = new Date();
      const rule: StoredPricingRule = {
        id: randomUUID(),
        userId: create.userId,
        defaultProfitMargin: create.defaultProfitMargin ?? 18,
        createdAt: now,
        updatedAt: now,
      };
      this.rules.set(rule.userId, rule);
      return Promise.resolve(rule);
    },
  };

  readonly pricingCalculation = {
    create: ({
      data,
    }: {
      data: Omit<StoredPricingCalculation, 'id' | 'createdAt'>;
    }): Promise<StoredPricingCalculation> => {
      const calculation: StoredPricingCalculation = {
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
      };
      this.calculations.set(calculation.id, calculation);
      return Promise.resolve(calculation);
    },

    findMany: ({
      where,
    }: {
      where: { userId: string; vehicleId?: string };
      orderBy?: { createdAt: 'desc' | 'asc' };
    }): Promise<StoredPricingCalculation[]> => {
      const calculations = Array.from(this.calculations.values())
        .filter((calculation) => {
          if (calculation.userId !== where.userId) {
            return false;
          }

          if (where.vehicleId && calculation.vehicleId !== where.vehicleId) {
            return false;
          }

          return true;
        })
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

      return Promise.resolve(calculations);
    },
  };

  reset(): void {
    this.rules.clear();
    this.calculations.clear();
  }

  seedRule(overrides: Partial<StoredPricingRule> = {}): StoredPricingRule {
    const now = new Date();
    const rule: StoredPricingRule = {
      id: overrides.id ?? randomUUID(),
      userId: overrides.userId ?? TEST_USER_ID,
      defaultProfitMargin: overrides.defaultProfitMargin ?? 18,
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
    };
    this.rules.set(rule.userId, rule);
    return rule;
  }

  seedCalculation(
    overrides: Partial<StoredPricingCalculation> = {},
  ): StoredPricingCalculation {
    const calculation: StoredPricingCalculation = {
      id: overrides.id ?? randomUUID(),
      userId: overrides.userId ?? TEST_USER_ID,
      vehicleId: overrides.vehicleId ?? TEST_VEHICLE_ID,
      purchasePriceSnapshot: overrides.purchasePriceSnapshot ?? 85000,
      totalExpensesSnapshot: overrides.totalExpensesSnapshot ?? 5000,
      totalInvestment: overrides.totalInvestment ?? 90000,
      profitMargin: overrides.profitMargin ?? 20,
      expectedProfit: overrides.expectedProfit ?? 18000,
      suggestedPrice: overrides.suggestedPrice ?? 108000,
      createdAt: overrides.createdAt ?? new Date(),
    };
    this.calculations.set(calculation.id, calculation);
    return calculation;
  }
}

class FakeVehicleClientService {
  mode: 'ok' | 'not-found' | 'unavailable' = 'ok';
  requests: Array<{ vehicleId: string; userId: string }> = [];

  findById(vehicleId: string, userId: string): Promise<VehicleResponse> {
    this.requests.push({ vehicleId, userId });

    if (this.mode === 'not-found') {
      return Promise.reject(new NotFoundException('Veículo não encontrado'));
    }

    if (this.mode === 'unavailable') {
      return Promise.reject(
        new ServiceUnavailableException('Vehicle Service indisponível'),
      );
    }

    return Promise.resolve({
      id: vehicleId,
      ownerId: userId,
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
    });
  }

  reset(): void {
    this.mode = 'ok';
    this.requests = [];
  }
}

class FakeExpenseClientService {
  mode: 'ok' | 'unavailable' = 'ok';
  requests: Array<{ vehicleId: string; userId: string }> = [];

  getVehicleTotal(vehicleId: string, userId: string) {
    this.requests.push({ vehicleId, userId });

    if (this.mode === 'unavailable') {
      return Promise.reject(
        new ServiceUnavailableException('Expense Service indisponível'),
      );
    }

    return Promise.resolve({
      vehicleId,
      totalExpenses: 5000,
      count: 3,
    });
  }

  reset(): void {
    this.mode = 'ok';
    this.requests = [];
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

describe('PricingController (e2e)', () => {
  let app: INestApplication;
  let fakePrisma: FakePrismaService;
  let fakeVehicleClient: FakeVehicleClientService;
  let fakeExpenseClient: FakeExpenseClientService;

  beforeAll(async () => {
    process.env.SWAGGER_DOCS = 'true';
    process.env.API_DOCS_UI = 'swagger';
    process.env.SERVICE_NAME = 'pricing-service';

    fakePrisma = new FakePrismaService();
    fakeVehicleClient = new FakeVehicleClientService();
    fakeExpenseClient = new FakeExpenseClientService();
    const { AppModule } = await import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .overrideProvider(VehicleClientService)
      .useValue(fakeVehicleClient)
      .overrideProvider(ExpenseClientService)
      .useValue(fakeExpenseClient)
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
    fakeVehicleClient.reset();
    fakeExpenseClient.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api-json should expose Pricing paths with x-user-id and no bearer auth', async () => {
    const response = await request(app.getHttpServer()).get('/api-json').expect(200);

    expect(response.body.paths).toEqual(
      expect.objectContaining({
        '/pricing/rules': expect.any(Object),
        '/pricing/vehicles/{vehicleId}': expect.any(Object),
        '/pricing/calculate': expect.any(Object),
        '/pricing/history': expect.any(Object),
        '/pricing/history/{vehicleId}': expect.any(Object),
      }),
    );
    expect(response.body.paths['/pricing/rules'].get.parameters).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'x-user-id' })]),
    );
    expect(response.body.paths['/pricing/rules'].get.tags).toEqual(['Pricing']);
    expect(JSON.stringify(response.body)).not.toContain('access-token');
  });

  it('GET /pricing/rules should create and return the default rule', async () => {
    const response = await request(app.getHttpServer())
      .get('/pricing/rules')
      .set(authHeaders())
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        userId: TEST_USER_ID,
        defaultProfitMargin: 18,
      }),
    );
  });

  it('PATCH /pricing/rules should update the default profit margin', async () => {
    const response = await request(app.getHttpServer())
      .patch('/pricing/rules')
      .set(authHeaders())
      .send({ defaultProfitMargin: 20 })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        userId: TEST_USER_ID,
        defaultProfitMargin: 20,
      }),
    );
  });

  it('PATCH /pricing/rules should reject negative margins', async () => {
    const response = await request(app.getHttpServer())
      .patch('/pricing/rules')
      .set(authHeaders())
      .send({ defaultProfitMargin: -10 })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining(['A margem padrão não pode ser negativa']),
    );
  });

  it('GET /pricing/rules should require x-user-id', async () => {
    const response = await request(app.getHttpServer())
      .get('/pricing/rules')
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Usuário autenticado não informado',
      error: 'Unauthorized',
    });
  });

  it('GET /pricing/vehicles/:vehicleId should preview pricing without saving history', async () => {
    const response = await request(app.getHttpServer())
      .get(`/pricing/vehicles/${TEST_VEHICLE_ID}`)
      .query({ margin: 20 })
      .set(authHeaders())
      .expect(200);

    expect(response.body).toEqual({
      vehicleId: TEST_VEHICLE_ID,
      vehicleLabel: 'Honda Civic 2020',
      purchasePrice: 85000,
      totalExpenses: 5000,
      totalInvestment: 90000,
      profitMargin: 20,
      expectedProfit: 18000,
      suggestedPrice: 108000,
      saved: false,
    });
    expect(fakePrisma.calculations.size).toBe(0);
    expect(fakeVehicleClient.requests).toEqual([
      { vehicleId: TEST_VEHICLE_ID, userId: TEST_USER_ID },
    ]);
    expect(fakeExpenseClient.requests).toEqual([
      { vehicleId: TEST_VEHICLE_ID, userId: TEST_USER_ID },
    ]);
  });

  it('POST /pricing/calculate should calculate and save history', async () => {
    const response = await request(app.getHttpServer())
      .post('/pricing/calculate')
      .set(authHeaders())
      .send({
        vehicleId: TEST_VEHICLE_ID,
        profitMargin: 20,
        saveHistory: true,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        vehicleId: TEST_VEHICLE_ID,
        totalInvestment: 90000,
        profitMargin: 20,
        expectedProfit: 18000,
        suggestedPrice: 108000,
        saved: true,
        calculationId: expect.any(String),
      }),
    );
    expect(fakePrisma.calculations.size).toBe(1);

    const history = await request(app.getHttpServer())
      .get('/pricing/history')
      .set(authHeaders())
      .expect(200);

    expect(history.body).toHaveLength(1);
    expect(history.body[0]).toEqual(
      expect.objectContaining({
        id: response.body.calculationId,
        userId: TEST_USER_ID,
        vehicleId: TEST_VEHICLE_ID,
      }),
    );
  });

  it('POST /pricing/calculate should calculate without saving history', async () => {
    const response = await request(app.getHttpServer())
      .post('/pricing/calculate')
      .set(authHeaders())
      .send({
        vehicleId: TEST_VEHICLE_ID,
        profitMargin: 20,
        saveHistory: false,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        saved: false,
        suggestedPrice: 108000,
      }),
    );
    expect(response.body.calculationId).toBeUndefined();
    expect(fakePrisma.calculations.size).toBe(0);
  });

  it('POST /pricing/calculate should use the default margin when omitted', async () => {
    fakePrisma.seedRule({ defaultProfitMargin: 18 });

    const response = await request(app.getHttpServer())
      .post('/pricing/calculate')
      .set(authHeaders())
      .send({
        vehicleId: TEST_VEHICLE_ID,
        saveHistory: true,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        profitMargin: 18,
        expectedProfit: 16200,
        suggestedPrice: 106200,
        saved: true,
      }),
    );
  });

  it('GET /pricing/history should return only the authenticated user history ordered by newest first', async () => {
    const older = fakePrisma.seedCalculation({
      userId: TEST_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
      createdAt: new Date('2026-06-20T10:00:00.000Z'),
    });
    const newer = fakePrisma.seedCalculation({
      userId: TEST_USER_ID,
      vehicleId: OTHER_VEHICLE_ID,
      createdAt: new Date('2026-06-25T10:00:00.000Z'),
    });
    fakePrisma.seedCalculation({
      userId: OTHER_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
      createdAt: new Date('2026-06-30T10:00:00.000Z'),
    });

    const response = await request(app.getHttpServer())
      .get('/pricing/history')
      .set(authHeaders())
      .expect(200);

    expect(response.body.map((item: { id: string }) => item.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });

  it('GET /pricing/history/:vehicleId should filter by user and vehicle', async () => {
    const expected = fakePrisma.seedCalculation({
      userId: TEST_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
    });
    fakePrisma.seedCalculation({
      userId: TEST_USER_ID,
      vehicleId: OTHER_VEHICLE_ID,
    });
    fakePrisma.seedCalculation({
      userId: OTHER_USER_ID,
      vehicleId: TEST_VEHICLE_ID,
    });

    const response = await request(app.getHttpServer())
      .get(`/pricing/history/${TEST_VEHICLE_ID}`)
      .set(authHeaders())
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expected.id,
        userId: TEST_USER_ID,
        vehicleId: TEST_VEHICLE_ID,
      }),
    );
  });

  it('GET /pricing/vehicles/:vehicleId should return 404 when the vehicle does not exist', async () => {
    fakeVehicleClient.mode = 'not-found';

    const response = await request(app.getHttpServer())
      .get(`/pricing/vehicles/${TEST_VEHICLE_ID}`)
      .set(authHeaders())
      .expect(404);

    expect(response.body.message).toBe('Veículo não encontrado');
  });

  it('GET /pricing/vehicles/:vehicleId should return 503 when Vehicle Service is unavailable', async () => {
    fakeVehicleClient.mode = 'unavailable';

    const response = await request(app.getHttpServer())
      .get(`/pricing/vehicles/${TEST_VEHICLE_ID}`)
      .set(authHeaders())
      .expect(503);

    expect(response.body.message).toBe('Vehicle Service indisponível');
  });

  it('GET /pricing/vehicles/:vehicleId should return 503 when Expense Service is unavailable', async () => {
    fakeExpenseClient.mode = 'unavailable';

    const response = await request(app.getHttpServer())
      .get(`/pricing/vehicles/${TEST_VEHICLE_ID}`)
      .set(authHeaders())
      .expect(503);

    expect(response.body.message).toBe('Expense Service indisponível');
  });
});
