import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupApiDocs } from './../src/docs/api-docs';

describe('AppController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  const originalEnv = { ...process.env };

  async function createApp(
    env: Record<string, string | undefined> = {},
    useDocs = false,
  ): Promise<INestApplication<App>> {
    process.env = { ...originalEnv, ...env };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const nestApp = moduleFixture.createNestApplication();

    if (useDocs) {
      await setupApiDocs(nestApp, {
        loadScalarApiReference: () =>
          Promise.resolve(() => {
            return (_req: Request, res: Response) => {
              res.status(200).send('<html><body>scalar</body></html>');
            };
          }),
      });
    }

    await nestApp.init();
    app = nestApp;
    return nestApp;
  }

  afterEach(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    app = undefined;
  });

  it('/ (GET)', async () => {
    const nestApp = await createApp();

    return request(nestApp.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('does not expose API docs when SWAGGER_DOCS is disabled', async () => {
    const nestApp = await createApp(
      {
        SWAGGER_DOCS: 'false',
      },
      true,
    );

    await request(nestApp.getHttpServer()).get('/api').expect(404);
  });

  it('exposes Swagger UI when API_DOCS_UI=swagger', async () => {
    const nestApp = await createApp(
      {
        SWAGGER_DOCS: 'true',
        SWAGGER_ROUTE: 'api',
        API_DOCS_UI: 'swagger',
      },
      true,
    );

    await request(nestApp.getHttpServer())
      .get('/api')
      .expect(200)
      .expect(/swagger-ui/i);

    await request(nestApp.getHttpServer())
      .get('/api-json')
      .expect(200)
      .expect(({ body }: { body: { info: { title: string } } }) => {
        expect(body.info.title).toBe('AutoProfit API');
      });
  });

  it('exposes Scalar UI when API_DOCS_UI=scalar', async () => {
    const nestApp = await createApp(
      {
        SWAGGER_DOCS: 'true',
        SWAGGER_ROUTE: 'api',
        API_DOCS_UI: 'scalar',
      },
      true,
    );

    await request(nestApp.getHttpServer())
      .get('/api')
      .expect(200)
      .expect(/scalar/i);

    await request(nestApp.getHttpServer())
      .get('/api-json')
      .expect(200)
      .expect(({ body }: { body: { info: { title: string } } }) => {
        expect(body.info.title).toBe('AutoProfit API');
      });
  });
});
