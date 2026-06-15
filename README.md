# AutoProfit

Backend base do AutoProfit, um sistema distribuído para gestão de revendas de veículos. Esta etapa entrega a infraestrutura inicial com NestJS, Prisma 7, Swagger/Scalar, PostgreSQL e RabbitMQ.

## Modos de Execução

O projeto pode ser executado de duas formas:

- Com Docker Compose: sobe PostgreSQL, RabbitMQ e todos os serviços.
- Local sem Docker: roda a aplicação NestJS pelo Node.js da máquina, usando um PostgreSQL acessível em `localhost`.

## Rodando com Docker Compose

Este é o modo recomendado para validar a infraestrutura distribuída completa.

Pré-requisito:

- Docker Desktop em execução.

Suba todos os containers:

```bash
docker compose up -d
```

Verifique os containers:

```bash
docker ps
```

Pare os containers:

```bash
docker compose down
```

Pare os containers e remova o volume do banco:

```bash
docker compose down -v
```

### Containers

- `postgres`: banco PostgreSQL.
- `rabbitmq`: broker RabbitMQ com interface de gerenciamento.
- `gateway`: API Gateway.
- `auth-service`: serviço de autenticação.
- `vehicle-service`: serviço de veículos.
- `expense-service`: serviço de despesas.
- `pricing-service`: serviço de precificação.
- `report-service`: serviço de relatórios.
- `notification-service`: serviço de notificações.

### Banco no Docker

O PostgreSQL do Docker Compose usa:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=autoprofit
```

Dentro da rede Docker, os serviços acessam o banco por:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/autoprofit?schema=public"
```

Os dados são persistidos no volume Docker `postgres_data`.

### Portas no Docker

- `gateway`: http://localhost:3001
- `auth-service`: http://localhost:3002
- `vehicle-service`: http://localhost:3003
- `expense-service`: http://localhost:3004
- `pricing-service`: http://localhost:3005
- `report-service`: http://localhost:3006
- `notification-service`: http://localhost:3007
- `postgres`: localhost:5432
- `rabbitmq`: localhost:5672
- `rabbitmq-management`: http://localhost:15672

### Documentação das APIs no Docker

- Gateway: http://localhost:3001/api
- Auth Service: http://localhost:3002/api
- Vehicle Service: http://localhost:3003/api
- Expense Service: http://localhost:3004/api
- Pricing Service: http://localhost:3005/api
- Report Service: http://localhost:3006/api
- Notification Service: http://localhost:3007/api

## Rodando Local sem Docker

Este modo executa a aplicação NestJS diretamente na máquina. Ele não sobe PostgreSQL nem RabbitMQ automaticamente.

Pré-requisitos:

- Node.js 22 ou superior.
- PostgreSQL rodando localmente ou exposto em `localhost:5432`.
- RabbitMQ local apenas se o fluxo em desenvolvimento depender de mensageria.

Instale as dependências:

```bash
npm install
```

Configure o `.env` local com a URL do banco acessível pela máquina:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autoprofit?schema=public"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="development-secret"
SWAGGER_DOCS=true
SWAGGER_ROUTE=api
API_DOCS_UI=scalar
```

Gere o client do Prisma:

```bash
npm run prisma:generate
```

Rode a aplicação em desenvolvimento:

```bash
npm run start:dev
```

Por padrão, a aplicação local usa `PORT=3000` quando a variável `PORT` não é definida.

Documentação local:

```text
http://localhost:3000/api
```

## Comandos Úteis

Build:

```bash
npm run build
```

Testes unitários:

```bash
npm test
```

Testes e2e:

```bash
npm run test:e2e
```

Lint:

```bash
npm run lint
```

## Variáveis de Documentação

As documentações das APIs ficam disponíveis em `/api` quando `SWAGGER_DOCS=true`.

```env
SWAGGER_DOCS=true
SWAGGER_ROUTE=api
API_DOCS_UI=scalar
```

Use `API_DOCS_UI=swagger` para trocar a interface para Swagger UI.

## Estrutura dos Serviços

Cada serviço possui seu próprio diretório com `Dockerfile` e `.env.example`:

- `gateway`
- `auth-service`
- `vehicle-service`
- `expense-service`
- `pricing-service`
- `report-service`
- `notification-service`

Nesta fase, os serviços ainda usam a base NestJS mínima do projeto. Nenhuma regra de negócio foi implementada.
