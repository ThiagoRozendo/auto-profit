import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

type ApiDocsUi = 'scalar' | 'swagger';
type ScalarApiReference =
  typeof import('@scalar/nestjs-api-reference').apiReference;

interface SetupApiDocsDependencies {
  loadScalarApiReference?: () => Promise<ScalarApiReference>;
}

const DEFAULT_DOCS_ROUTE = 'api';
const DEFAULT_DOCS_TITLE = 'AutoProfit API';
const DEFAULT_DOCS_DESCRIPTION =
  'Interactive API documentation for the AutoProfit backend.';
const DEFAULT_DOCS_VERSION = '1.0.0';

export async function setupApiDocs(
  app: INestApplication,
  dependencies: SetupApiDocsDependencies = {},
): Promise<void> {
  if (!isDocsEnabled(process.env.SWAGGER_DOCS)) {
    return;
  }

  const route = normalizeRoute(process.env.SWAGGER_ROUTE);
  const ui = resolveApiDocsUi(process.env.API_DOCS_UI);
  const jsonDocumentUrl = `${route}-json`;

  const documentConfig = new DocumentBuilder()
    .setTitle(DEFAULT_DOCS_TITLE)
    .setDescription(DEFAULT_DOCS_DESCRIPTION)
    .setVersion(process.env.npm_package_version ?? DEFAULT_DOCS_VERSION)
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, documentConfig, {
      autoTagControllers: true,
    });

  if (ui === 'swagger') {
    SwaggerModule.setup(route, app, documentFactory, {
      jsonDocumentUrl,
      raw: ['json'],
    });
    return;
  }

  SwaggerModule.setup(route, app, documentFactory, {
    jsonDocumentUrl,
    raw: ['json'],
    ui: false,
  });

  const apiReference = dependencies.loadScalarApiReference
    ? await dependencies.loadScalarApiReference()
    : await loadScalarApiReference();

  app.use(
    `/${route}`,
    apiReference({
      url: `/${jsonDocumentUrl}`,
      withFastify: app.getHttpAdapter().getType() === 'fastify',
    }),
  );
}

function isDocsEnabled(value?: string): boolean {
  if (!value) {
    return true;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function normalizeRoute(value?: string): string {
  const normalized = value?.trim().replace(/^\/+|\/+$/g, '');
  return normalized || DEFAULT_DOCS_ROUTE;
}

function resolveApiDocsUi(value?: string): ApiDocsUi {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'swagger') {
    return 'swagger';
  }

  return 'scalar';
}

async function loadScalarApiReference(): Promise<ScalarApiReference> {
  const scalarModuleUrl = pathToFileURL(
    join(
      process.cwd(),
      'node_modules',
      '@scalar',
      'nestjs-api-reference',
      'dist',
      'index.js',
    ),
  ).href;
  const scalarModule = (await import(
    scalarModuleUrl
  )) as typeof import('@scalar/nestjs-api-reference');

  return scalarModule.apiReference;
}
