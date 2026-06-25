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
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';

type UserRole = 'ADMIN' | 'MANAGER' | 'SELLER';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

@Catch()
class TestLoggingFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<import('express').Response>();

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

  if (
    typeof exception === 'object' &&
    exception !== null &&
    'response' in exception &&
    typeof exception.response === 'object' &&
    exception.response !== null
  ) {
    const response = exception.response as {
      message?: string | string[];
      error?: string;
    };

    return {
      message: response.message ?? 'Internal server error',
      error: response.error,
    };
  }

  if (exception instanceof Error) {
    return { message: exception.message };
  }

  return {
    message: statusCode === 500 ? 'Internal server error' : 'Unexpected error',
  };
}

class FakePrismaService {
  private users = new Map<string, StoredUser>();

  readonly user = {
    findUnique: ({
      where,
    }: {
      where: { id?: string; email?: string };
    }): Promise<StoredUser | null> => {
      if (where.id) {
        return Promise.resolve(this.users.get(where.id) ?? null);
      }

      if (where.email) {
        return Promise.resolve(
          Array.from(this.users.values()).find(
            (user) => user.email === where.email,
          ) ?? null,
        );
      }

      return Promise.resolve(null);
    },

    create: ({
      data,
    }: {
      data: { name: string; email: string; passwordHash: string };
    }): Promise<StoredUser> => {
      const now = new Date();
      const user: StoredUser = {
        id: randomUUID(),
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: 'SELLER',
        createdAt: now,
        updatedAt: now,
      };

      this.users.set(user.id, user);
      return Promise.resolve(user);
    },
  };

  reset(): void {
    this.users.clear();
  }
}

describe('AuthController (e2e)', () => {
  let app: any;
  let fakePrisma: FakePrismaService;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.SWAGGER_DOCS = 'false';

    fakePrisma = new FakePrismaService();
    const { AppModule } = await import('../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new TestLoggingFilter());
    await app.init();
  });

  afterEach(() => {
    fakePrisma.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should create a user without exposing passwordHash', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Joao Silva',
        email: 'joao@example.com',
        password: '123456',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Joao Silva',
        email: 'joao@example.com',
        role: 'SELLER',
      }),
    );
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
  });

  it('POST /auth/register should validate the request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: '',
        email: 'not-an-email',
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
  });

  it('POST /auth/register should reject duplicate email', async () => {
    const payload = {
      name: 'Joao Silva',
      email: 'joao@example.com',
      password: '123456',
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409);

    expect(response.body.message).toBe('Este e-mail já está em uso');
  });

  it('POST /auth/login should return a JWT for valid credentials', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Joao Silva',
      email: 'joao@example.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'joao@example.com',
        password: '123456',
      })
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('POST /auth/login should reject invalid credentials', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Joao Silva',
      email: 'joao@example.com',
      password: '123456',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'joao@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body.message).toBe('E-mail ou senha inválidos');
  });

  it('GET /auth/me should require a bearer token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me should return the authenticated user', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Joao Silva',
      email: 'joao@example.com',
      password: '123456',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'joao@example.com',
        password: '123456',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Joao Silva',
        email: 'joao@example.com',
        role: 'SELLER',
      }),
    );
    expect(response.body).not.toHaveProperty('passwordHash');
  });
});
