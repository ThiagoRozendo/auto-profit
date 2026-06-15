import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApiDocs(app: INestApplication): void {
  if (!isDocsEnabled(process.env.SWAGGER_DOCS)) {
    return;
  }

  const route = normalizeRoute(process.env.SWAGGER_ROUTE);
  const jsonDocumentUrl = `${route}-json`;
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${process.env.SERVICE_NAME ?? 'gateway'} API`)
      .setDescription('AutoProfit distributed service API documentation.')
      .setVersion('1.0.0')
      .build(),
    { autoTagControllers: true },
  );

  if (resolveDocsUi(process.env.API_DOCS_UI) === 'swagger') {
    SwaggerModule.setup(route, app, document, {
      jsonDocumentUrl,
      raw: ['json'],
    });
    return;
  }

  SwaggerModule.setup(route, app, document, {
    jsonDocumentUrl,
    raw: ['json'],
    ui: false,
  });

  app.use(`/${route}`, (_request, response) => {
    response.type('html').send(renderScalarHtml(`/${jsonDocumentUrl}`));
  });
}

function isDocsEnabled(value?: string): boolean {
  return !value || ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function normalizeRoute(value?: string): string {
  return value?.trim().replace(/^\/+|\/+$/g, '') || 'api';
}

function resolveDocsUi(value?: string): 'scalar' | 'swagger' {
  return value?.trim().toLowerCase() === 'swagger' ? 'swagger' : 'scalar';
}

function renderScalarHtml(specUrl: string): string {
  return `<!doctype html>
<html>
  <head>
    <title>AutoProfit API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="${specUrl}"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
