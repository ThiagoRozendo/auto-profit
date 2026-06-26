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
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { InternalHttpService } from '../src/common/http/internal-http.service';

class FakeInternalHttpService {
  responseQueue: unknown[] = [];
  calls: Array<{
    method: 'GET' | 'POST';
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

describe('AuthProxyController (e2e)', () => {
  let app: INestApplication;
  let fakeInternalHttpService: FakeInternalHttpService;

  beforeAll(async () => {
    process.env.AUTH_SERVICE_URL = 'http://localhost:3002';
    process.env.JWT_SECRET = 'development-secret';
    process.env.SWAGGER_DOCS = 'false';

    fakeInternalHttpService = new FakeInternalHttpService();

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

  it('POST /auth/register should proxy register payload and response', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: '31a217fd-393c-4e1d-9889-b35360eb7cc6',
      name: 'Joao',
      email: 'joao@email.com',
      role: 'SELLER',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });

    const payload = {
      name: 'Joao',
      email: 'joao@email.com',
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201);

    expect(response.body).toEqual({
      id: '31a217fd-393c-4e1d-9889-b35360eb7cc6',
      name: 'Joao',
      email: 'joao@email.com',
      role: 'SELLER',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'POST',
        url: 'http://localhost:3002/auth/register',
        data: payload,
        headers: undefined,
      },
    ]);
  });

  it('POST /auth/login should return the upstream token with 200', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      accessToken: 'jwt-token',
    });

    const payload = {
      email: 'joao@email.com',
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(200);

    expect(response.body).toEqual({
      accessToken: 'jwt-token',
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'POST',
        url: 'http://localhost:3002/auth/login',
        data: payload,
        headers: undefined,
      },
    ]);
  });

  it('GET /auth/me should forward the bearer token to the Auth Service', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue({
      id: '31a217fd-393c-4e1d-9889-b35360eb7cc6',
      name: 'Joao',
      email: 'joao@email.com',
      role: 'SELLER',
    });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer jwt-token')
      .expect(200);

    expect(response.body).toEqual({
      id: '31a217fd-393c-4e1d-9889-b35360eb7cc6',
      name: 'Joao',
      email: 'joao@email.com',
      role: 'SELLER',
    });
    expect(fakeInternalHttpService.calls).toEqual([
      {
        method: 'GET',
        url: 'http://localhost:3002/auth/me',
        headers: {
          authorization: 'Bearer jwt-token',
        },
      },
    ]);
  });

  it('should propagate upstream conflict errors', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new HttpException(
        {
          statusCode: 409,
          message: 'Este e-mail já está em uso',
          error: 'Conflict',
        },
        409,
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Joao',
        email: 'joao@email.com',
        password: '123456',
      })
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      message: 'Este e-mail já está em uso',
      error: 'Conflict',
    });
  });

  it('should propagate upstream unauthorized errors', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new HttpException(
        {
          statusCode: 401,
          message: 'E-mail ou senha inválidos',
          error: 'Unauthorized',
        },
        401,
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'joao@email.com',
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'E-mail ou senha inválidos',
      error: 'Unauthorized',
    });
  });

  it('should return 503 when the Auth Service is unavailable', async () => {
    fakeInternalHttpService.reset();
    fakeInternalHttpService.enqueue(
      new ServiceUnavailableException('Auth Service indisponivel'),
    );

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(503);

    expect(response.body).toEqual({
      statusCode: 503,
      message: 'Auth Service indisponivel',
      error: 'Service Unavailable',
    });
  });

  it('should validate register payload before proxying', async () => {
    fakeInternalHttpService.reset();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: '',
        email: 'invalid',
        password: '123',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'name should not be empty',
        'email must be an email',
        'password must be longer than or equal to 6 characters',
      ]),
    );
    expect(fakeInternalHttpService.calls).toEqual([]);
  });
});
