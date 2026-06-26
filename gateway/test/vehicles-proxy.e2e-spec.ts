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

describe('VehiclesProxyController (e2e)', () => {
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
    process.env.JWT_SECRET = 'development-secret';
    process.env.SWAGGER_DOCS = 'false';

    fakeInternalHttpService = new FakeInternalHttpService();
    jwtService = new JwtService({ secret: process.env.JWT_SECRET });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(InternalHttpService)
      .useValue(fakeInternalHttpService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /vehicles should proxy payload and internal user headers', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'veh-1',
      ownerId: accessTokenPayload.sub,
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
      observations: 'Veiculo em bom estado.',
      soldAt: null,
      salePrice: null,
      saleNotes: null,
      createdAt: '2026-06-26T10:00:00.000Z',
      updatedAt: '2026-06-26T10:00:00.000Z',
    });

    const payload = {
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
      observations: 'Veiculo em bom estado.',
    };

    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'veh-1',
      ownerId: accessTokenPayload.sub,
      plate: 'ABC1D23',
      status: 'AVAILABLE',
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'POST',
        url: 'http://localhost:3003/vehicles',
        data: payload,
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /vehicles should proxy query params and headers', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue([
      {
        id: 'veh-1',
        ownerId: accessTokenPayload.sub,
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        plate: 'ABC1D23',
        purchasePrice: 85000,
        status: 'AVAILABLE',
        createdAt: '2026-06-26T10:00:00.000Z',
        updatedAt: '2026-06-26T10:00:00.000Z',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/vehicles')
      .query({ status: 'AVAILABLE', search: 'civ' })
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3003/vehicles?status=AVAILABLE&search=civ',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('GET /vehicles/:id should proxy the requested id', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'veh-1',
      ownerId: accessTokenPayload.sub,
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'AVAILABLE',
      createdAt: '2026-06-26T10:00:00.000Z',
      updatedAt: '2026-06-26T10:00:00.000Z',
    });

    await request(app.getHttpServer())
      .get('/vehicles/veh-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3003/vehicles/veh-1',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('PATCH /vehicles/:id should proxy partial updates', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'veh-1',
      ownerId: accessTokenPayload.sub,
      brand: 'Honda',
      model: 'Civic Touring',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 86000,
      status: 'AVAILABLE',
      createdAt: '2026-06-26T10:00:00.000Z',
      updatedAt: '2026-06-26T12:00:00.000Z',
    });

    const payload = {
      model: 'Civic Touring',
      purchasePrice: 86000,
    };

    await request(app.getHttpServer())
      .patch('/vehicles/veh-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send(payload)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'PATCH',
        url: 'http://localhost:3003/vehicles/veh-1',
        data: payload,
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('DELETE /vehicles/:id should proxy delete and return 204', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(undefined);

    await request(app.getHttpServer())
      .delete('/vehicles/veh-1')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(204);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'DELETE',
        url: 'http://localhost:3003/vehicles/veh-1',
        headers: {
          'x-user-id': accessTokenPayload.sub,
          'x-user-email': accessTokenPayload.email,
          'x-user-role': accessTokenPayload.role,
        },
      },
    ]);
  });

  it('PATCH /vehicles/:id/sell should proxy sale payload', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: 'veh-1',
      ownerId: accessTokenPayload.sub,
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      plate: 'ABC1D23',
      purchasePrice: 85000,
      status: 'SOLD',
      soldAt: '2026-06-26T13:00:00.000Z',
      salePrice: 95000,
      saleNotes: 'Venda a vista.',
      createdAt: '2026-06-26T10:00:00.000Z',
      updatedAt: '2026-06-26T13:00:00.000Z',
    });

    const payload = {
      salePrice: 95000,
      soldAt: '2026-06-26T13:00:00.000Z',
      saleNotes: 'Venda a vista.',
    };

    await request(app.getHttpServer())
      .patch('/vehicles/veh-1/sell')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send(payload)
      .expect(200);

    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'PATCH',
        url: 'http://localhost:3003/vehicles/veh-1/sell',
        data: payload,
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
      .post('/vehicles')
      .send({
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        plate: 'ABC1D23',
        purchasePrice: 85000,
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: 401,
    });
    expect(fakeInternalHttpService.calls).toEqual([]);
  });

  it('should validate vehicle payload before proxying', async () => {
    fakeInternalHttpService.reset();

    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .send({
        brand: '',
        model: '',
        year: '2020',
        plate: '',
        purchasePrice: -1,
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'brand should not be empty',
        'model should not be empty',
        'year must be an integer number',
        'plate should not be empty',
        'purchasePrice must not be less than 0',
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
          message: 'Veiculo nao encontrado',
          error: 'Not Found',
        },
        404,
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/vehicles/veh-missing')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Veiculo nao encontrado',
      error: 'Not Found',
    });
  });

  it('should return 503 when the Vehicle Service is unavailable', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new ServiceUnavailableException('Vehicle Service indisponivel'),
    );

    const response = await request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${signAccessToken()}`)
      .expect(503);

    expect(response.body).toEqual({
      statusCode: 503,
      message: 'Vehicle Service indisponivel',
      error: 'Service Unavailable',
    });
  });
});
