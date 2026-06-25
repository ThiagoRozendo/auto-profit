# AutoProfit

Backend base do AutoProfit, um sistema distribuído para gestão de revendas de veículos. A infraestrutura inicial usa NestJS, Prisma 7, PostgreSQL multi-schema, RabbitMQ, Docker Compose e documentação Swagger/Scalar.

## Arquitetura

O projeto é composto por serviços independentes. Cada serviço roda em seu próprio processo, possui seu próprio `package.json`, `Dockerfile`, `.env.example`, `src/` e configuração Prisma.

| Serviço | Porta | Schema PostgreSQL | Swagger/Scalar |
| --- | ---: | --- | --- |
| `gateway` | `3001` | não usa schema próprio nesta etapa | `http://localhost:3001/api` |
| `auth-service` | `3002` | `auth` | `http://localhost:3002/api` |
| `vehicle-service` | `3003` | `vehicle` | `http://localhost:3003/api` |
| `expense-service` | `3004` | `expense` | `http://localhost:3004/api` |
| `pricing-service` | `3005` | `pricing` | `http://localhost:3005/api` |
| `report-service` | `3006` | `report` | `http://localhost:3006/api` |
| `notification-service` | `3007` | `notification` | `http://localhost:3007/api` |

O diretório `src/` da raiz pertence à aplicação base original do repositório. Para o projeto distribuído, novas funcionalidades devem ser implementadas dentro do `src/` do serviço responsável, por exemplo `auth-service/src`.

## Rodando com Docker Compose

Use este modo para subir a infraestrutura distribuída completa.

Pré-requisitos:

- Docker Desktop em execução.

Subir todos os containers:

```bash
docker compose up -d
```

Verificar containers:

```bash
docker ps
```

Parar containers:

```bash
docker compose down
```

Parar containers e apagar o volume do PostgreSQL:

```bash
docker compose down -v
```

Use `docker compose down -v` quando precisar recriar o banco do zero. Scripts em `docker/postgres/init.sql` só rodam automaticamente quando o volume do PostgreSQL é criado pela primeira vez.

Para desenvolvimento local de um serviço na máquina, prefira subir apenas a infraestrutura compartilhada:

```bash
npm run docker:infra:up
```

Esse fluxo evita conflito de portas com os containers dos próprios serviços quando você roda `npm run start:dev` localmente.

### Containers

- `postgres`: PostgreSQL.
- `rabbitmq`: RabbitMQ com interface de gerenciamento.
- `gateway`: API Gateway.
- `auth-service`: serviço de autenticação.
- `vehicle-service`: serviço de veículos.
- `expense-service`: serviço de despesas.
- `pricing-service`: serviço de precificação.
- `report-service`: serviço de relatórios.
- `notification-service`: serviço de notificações.

### Portas

| Container | URL/porta |
| --- | --- |
| Gateway | `http://localhost:3001` |
| Auth Service | `http://localhost:3002` |
| Vehicle Service | `http://localhost:3003` |
| Expense Service | `http://localhost:3004` |
| Pricing Service | `http://localhost:3005` |
| Report Service | `http://localhost:3006` |
| Notification Service | `http://localhost:3007` |
| PostgreSQL | `localhost:5433` |
| RabbitMQ | `localhost:5672` |
| RabbitMQ Management | `http://localhost:15672` |

## Banco de Dados

O projeto usa um único PostgreSQL com um banco principal e um banco shadow para migrations do Prisma:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=autoprofit
```

O banco principal é `autoprofit`. O banco shadow é `autoprofit_shadow`.

O script `docker/postgres/init.sql` cria os schemas abaixo nos dois bancos:

```text
auth
vehicle
expense
pricing
report
notification
```

Cada serviço acessa apenas o próprio schema. O schema `public` não deve ser usado pelos serviços.

Exemplo do Auth Service dentro do Docker Compose:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/autoprofit?schema=auth"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@postgres:5432/autoprofit_shadow?schema=auth"
```

Exemplo do Auth Service rodando localmente na máquina:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/autoprofit?schema=auth"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/autoprofit_shadow?schema=auth"
```

## Rodando um Serviço Localmente

Este modo executa apenas um serviço NestJS diretamente na máquina. Ele não sobe PostgreSQL nem RabbitMQ automaticamente.

Pré-requisitos:

- Node.js 22 ou superior.
- PostgreSQL acessível em `localhost:5433`.
- RabbitMQ acessível em `localhost:5672`, caso o fluxo em desenvolvimento use mensageria.

Entre na pasta do serviço:

```bash
cd auth-service
```

Instale as dependências:

```bash
npm install
```

Crie o `.env` a partir do `.env.example` do serviço e ajuste as URLs para `localhost`:

```env
NODE_ENV=development
SERVICE_NAME=auth-service
PORT=3002
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/autoprofit?schema=auth"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/autoprofit_shadow?schema=auth"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="development-secret"
SWAGGER_DOCS=true
SWAGGER_ROUTE=api
API_DOCS_UI=scalar
```

Se você tiver subido a stack completa com `docker compose up -d`, pare os containers dos serviços antes de rodar um serviço local:

```bash
npm run docker:apps:down
```

Rode o serviço:

```bash
npm run start:dev
```

Para rodar outro serviço localmente, entre na pasta dele e use a porta e o schema correspondentes à tabela de arquitetura.

## Prisma nos Serviços

Cada serviço de domínio possui seu próprio `prisma/schema.prisma`.

Nesta etapa, os schemas Prisma ficam apenas com a configuração base:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Não há models, enums ou migrations de negócio nesta configuração inicial. Cada integrante deve criar as futuras migrations apenas dentro do serviço responsável pelo módulo.

Comandos úteis dentro de um serviço:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
```

## Swagger e Scalar

As documentações das APIs ficam disponíveis em `/api` quando `SWAGGER_DOCS=true`.

```env
SWAGGER_DOCS=true
SWAGGER_ROUTE=api
API_DOCS_UI=scalar
```

Use `API_DOCS_UI=swagger` para trocar a interface para Swagger UI.

## Comandos da Raiz

Na raiz, os comandos abaixo validam a aplicação base compartilhada:

```bash
npm run build
npm test
npm run test:e2e
npm run lint
```
