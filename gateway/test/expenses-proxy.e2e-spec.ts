import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';
import {
  HttpException,
  ServiceUnavailableException,
  type INestApplication,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { InternalHttpService } from '../src/common/http/internal-http.service';
import { setupApiDocs } from '../src/docs/api-docs';

class FakeInternalHttpService {
  responseQueue: unknown[] = [];
  calls: Array<{
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
  }> = [];

  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.calls.push({ method: 'GET', url, headers });
    return this.consume<T>();
  }

  async post<T>(
    url: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.calls.push({ method: 'POST', url, data, headers });
    return this.consume<T>();
  }

  async patch<T>(
    url: string,
    data: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.calls.push({ method: 'PATCH', url, data, headers });
    return this.consume<T>();
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.calls.push({ method: 'DELETE', url, headers });
    return this.consume<T>();
  }

  enqueue(response: unknown): void {
    this.responseQueue.push(response);
  }

  reset(): void {
    this.responseQueue = [];
    this.calls = [];
  }

  private consume<T>(): Promise<T> {
    const next = this.responseQueue.shift();

    if (next instanceof Error) {
      return Promise.reject(next);
    }

    return Promise.resolve(next as T);
  }
}

describe('ExpensesProxyController (e2e)', () => {
  let app: INestApplication;
  let fakeInternalHttpService: FakeInternalHttpService;
  let jwtService: JwtService;

  const accessTokenPayload = {
    sub: '31a217fd-393c-4e1d-9889-b35360eb7cc6',
    email: 'joao@email.com',
    role: 'SELLER' as const,
  };

  function signAccessToken(): string {
    return jwtService.sign(accessTokenPayload);
  }

  beforeAll(async () => {
    process.env.AUTH_SERVICE_URL = 'http://localhost:3002';
    process.env.VEHICLE_SERVICE_URL = 'http://localhost:3003';
    process.env.EXPENSE_SERVICE_URL = 'http://localhost:3004';
    process.env.JWT_SECRET = 'development-secret';
    process.env.SWAGGER_DOCS = 'true';
    process.env.API_DOCS_UI = 'swagger';

    fakeInternalHttpService = new FakeInternalHttpService();
    jwtService = new JwtService({ secret: process.env.JWT_SECRET });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(InternalHttpService)
      .useValue(fakeInternalHttpService)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApiDocs(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api-json should include expenses routes in the gateway OpenAPI', async () => {
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
        '/expenses/vehicle/{vehicleId}': expect.any(Object),
        '/expenses/vehicle/{vehicleId}/total': expect.any(Object),
        '/expenses/{id}': expect.any(Object),
      }),
    );
  });

  it('POST /expenses should proxy payload and internal user headers', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'exp-1',
      userId: accessTokenPayload.sub,
      vehicleId: '22222222-2222-4222-8222-222222222222',
      vehicleLabel: 'Honda Civic 2020',
      description: 'Troca de pneus',
      category: 'MAINTENANCE',
      amount: 1800,
      expenseDate: '2026-06-25T10:00:00.000Z',
      createdAt: '2026-06-25T10:05:00.000Z',
      updatedAt: '2026-06-25T10:05:00.000Z',
    });

    const payload = {
      vehicleId: '22222222-2222-4222-8222-222222222222',
      vehicleLabel: 'Honda Civic 2020',
      description: 'Troca de pneus',
      category: 'MAINTENANCE',
      amount: 1800,
      expenseDate: '2026-06-25T10:00:00.000Z',
    };

    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'exp-1',
      userId: accessTokenPayload.sub,
      description: 'Troca de pneus',
      amount: 1800,
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'POST',
        url: 'http://localhost:3004/expenses',
        data: payload,
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /expenses should proxy query params and headers', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue([
      {
        id: 'exp-1',
        userId: accessTokenPayload.sub,
        vehicleId: '22222222-2222-4222-8222-222222222222',
        vehicleLabel: 'Honda Civic 2020',
        description: 'Troca de pneus',
        category: 'MAINTENANCE',
        amount: 1800,
        expenseDate: '2026-06-25T10:00:00.000Z',
        createdAt: '2026-06-25T10:05:00.000Z',
        updatedAt: '2026-06-25T10:05:00.000Z',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/expenses')
      .query({
        vehicleId: '22222222-2222-4222-8222-222222222222',
        category: 'MAINTENANCE',
        search: 'pneu',
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-30T23:59:59.999Z',
      })
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url:
          'http://localhost:3004/expenses?vehicleId=22222222-2222-4222-8222-222222222222&category=MAINTENANCE&search=pneu&startDate=2026-06-01T00%3A00%3A00.000Z&endDate=2026-06-30T23%3A59%3A59.999Z',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /expenses/:id should proxy the requested id', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'exp-1',
      userId: accessTokenPayload.sub,
      vehicleId: '22222222-2222-4222-8222-222222222222',
      vehicleLabel: 'Honda Civic 2020',
      description: 'Troca de pneus',
      category: 'MAINTENANCE',
      amount: 1800,
      expenseDate: '2026-06-25T10:00:00.000Z',
      createdAt: '2026-06-25T10:05:00.000Z',
      updatedAt: '2026-06-25T10:05:00.000Z',
    });

    await request(app.getHttpServer())
      .get('/expenses/exp-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3004/expenses/exp-1',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('PATCH /expenses/:id should proxy partial updates', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'exp-1',
      userId: accessTokenPayload.sub,
      vehicleId: '22222222-2222-4222-8222-222222222222',
      vehicleLabel: 'Honda Civic 2020',
      description: 'Troca de pneus e alinhamento',
      category: 'MAINTENANCE',
      amount: 2100,
      expenseDate: '2026-06-25T10:00:00.000Z',
      createdAt: '2026-06-25T10:05:00.000Z',
      updatedAt: '2026-06-25T10:15:00.000Z',
    });

    const payload = {
      description: 'Troca de pneus e alinhamento',
      amount: 2100,
    };

    await request(app.getHttpServer())
      .patch('/expenses/exp-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send(payload)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'PATCH',
        url: 'http://localhost:3004/expenses/exp-1',
        data: payload,
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('DELETE /expenses/:id should proxy delete and return 204', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(undefined);

    await request(app.getHttpServer())
      .delete('/expenses/exp-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(204);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'DELETE',
        url: 'http://localhost:3004/expenses/exp-1',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /expenses/vehicle/:vehicleId should proxy the vehicle expense list', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue([
      {
        id: 'exp-1',
        userId: accessTokenPayload.sub,
        vehicleId: 'veh-1',
        vehicleLabel: 'Honda Civic 2020',
        description: 'Troca de pneus',
        category: 'MAINTENANCE',
        amount: 1800,
        expenseDate: '2026-06-25T10:00:00.000Z',
        createdAt: '2026-06-25T10:05:00.000Z',
        updatedAt: '2026-06-25T10:05:00.000Z',
      },
    ]);

    await request(app.getHttpServer())
      .get('/expenses/vehicle/veh-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3004/expenses/vehicle/veh-1',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /expenses/vehicle/:vehicleId/total should proxy the total endpoint', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      vehicleId: 'veh-1',
      totalExpenses: 3500,
      count: 3,
    });

    const response = await request(app.getHttpServer())
      .get('/expenses/vehicle/veh-1/total')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(response.body).toEqual({
      vehicleId: 'veh-1',
      totalExpenses: 3500,
      count: 3,
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3004/expenses/vehicle/veh-1/total',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('should require a valid bearer token', async () => {
    fakeInternalHttpService.reset();

    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send({
        vehicleId: '22222222-2222-4222-8222-222222222222',
        description: 'Troca de pneus',
        amount: 1800,
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: 401,
    });
    expect(fakeInternalHttpService.calls).toEqual([]);
  });

  it('should validate expense payload before proxying', async () => {
    fakeInternalHttpService.reset();

    const response = await request(app.getHttpServer())
      .post('/expenses')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send({
        vehicleId: 'invalid-uuid',
        description: '',
        category: 'INVALID_CATEGORY',
        amount: -1,
        expenseDate: 'not-a-date',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'vehicleId must be a UUID',
        'description should not be empty',
        'category must be one of the following values: MAINTENANCE, DOCUMENTATION, CLEANING, TRANSPORT, PARTS, OTHER',
        'amount must not be less than 0',
        'expenseDate must be a valid ISO 8601 date string',
      ]),
    );
    expect(fakeInternalHttpService.calls).toEqual([]);
  });

  it('should propagate upstream not found errors', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new HttpException(
        {
          statusCode: 404,
          message: 'Despesa não encontrada',
          error: 'Not Found',
        },
        404,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/expenses/exp-missing')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Despesa não encontrada',
      error: 'Not Found',
    });
  });

  it('should return 503 when the Expense Service is unavailable', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new ServiceUnavailableException('Expense Service indisponível'),
    );

    const response = await request(app.getHttpServer())
      .get('/expenses')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(503);

    expect(response.body).toEqual({
      statusCode: 503,
      message: 'Expense Service indisponível',
      error: 'Service Unavailable',
    });
  });
});
