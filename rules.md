# Regras do Backend - AutoProfit

## Objetivo deste arquivo

Este arquivo define as regras de desenvolvimento do backend do AutoProfit. Ele deve ser seguido por todos os integrantes para manter o código organizado, padronizado e coerente entre os módulos.

---

## Distribuição da equipe

### Integrante 1

* API Gateway
* Notification Service

### Integrante 2

* Frontend
* Auth Service

### Integrante 3

* Vehicle Service
* Expense Service

### Integrante 4

* Pricing Service
* Report Service

---

## Regras gerais

* O backend deve ser desenvolvido em NestJS com TypeScript.
* Cada módulo principal deve ser um serviço independente.
* Cada serviço deve rodar em uma porta própria.
* A comunicação entre serviços deve ocorrer por HTTP/REST e RabbitMQ.
* O projeto deve ser organizado para execução com Docker Compose.
* Não colocar senhas, tokens ou secrets diretamente no código.
* Toda configuração sensível deve vir de variáveis de ambiente.
* Todo serviço deve possuir arquivo `.env.example`.
* Todo serviço deve possuir documentação mínima de execução.

---

## Stack obrigatória

* Node.js
* NestJS
* TypeScript
* Prisma ORM 7
* PostgreSQL
* Docker
* Docker Compose
* RabbitMQ
* Firebase Cloud Messaging (FCM)
* JWT

---

## Regras Prisma 7

Todos os serviços que utilizarem banco de dados devem utilizar Prisma ORM 7.

Exemplo:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Regras:

* Utilizar migrations.
* Não alterar tabelas manualmente.
* Cada serviço é dono dos seus próprios dados.
* Um serviço nunca deve acessar diretamente a tabela de outro serviço.

---

## Estrutura padrão dos serviços

```text
src/
├── main.ts
├── app.module.ts
├── modules/
│   └── module-name/
│       ├── controllers/
│       ├── services/
│       ├── dto/
│       ├── entities/
│       └── module-name.module.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── decorators/
│   └── exceptions/
└── config/
```

---

## Controllers

* Não implementar regra de negócio.
* Não acessar Prisma diretamente.
* Apenas receber requisições e delegar para services.

Correto:

```ts
@Post()
create(@Body() dto: CreateVehicleDto) {
  return this.vehicleService.create(dto);
}
```

Incorreto:

```ts
@Post()
async create(@Body() dto: CreateVehicleDto) {
  return this.prisma.vehicle.create({
    data: dto,
  });
}
```

---

## Services

* Toda regra de negócio deve estar nos services.
* Services podem consumir outros microsserviços.
* Services podem publicar eventos RabbitMQ.
* Services devem lançar exceções NestJS.

---

## DTOs

Todo input deve possuir DTO.

Obrigatório utilizar:

```ts
class-validator
class-transformer
```

Exemplo:

```ts
export class CreateVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  year: number;

  @IsNumber()
  purchasePrice: number;
}
```

---

## Convenções

### Arquivos

```text
vehicle.service.ts
vehicle.controller.ts
create-vehicle.dto.ts
```

### Classes

```ts
VehicleService
CreateVehicleDto
```

### Variáveis

```ts
purchasePrice
totalExpenses
profitMargin
```

### Rotas

```text
/vehicles
/expenses
/pricing
/reports
/notifications
```

---

## API REST

### Vehicles

```http
GET    /vehicles
GET    /vehicles/:id
POST   /vehicles
PATCH  /vehicles/:id
DELETE /vehicles/:id
PATCH  /vehicles/:id/sell
```

### Expenses

```http
GET    /expenses
POST   /expenses
DELETE /expenses/:id
```

### Pricing

```http
GET /pricing/vehicles/:id
```

### Notifications

```http
GET   /notifications
PATCH /notifications/:id/read
POST  /notifications/device-token
```

---

## Comunicação entre serviços

### Comunicação síncrona

Utilizar HTTP REST.

Exemplos:

```text
Gateway -> Auth
Gateway -> Vehicle
Gateway -> Expense
Gateway -> Pricing
Gateway -> Report
Gateway -> Notification
Pricing -> Vehicle
Pricing -> Expense
```

### Comunicação assíncrona

Utilizar RabbitMQ.

Eventos:

```text
vehicle.created
vehicle.updated
vehicle.sold

expense.created
expense.deleted

pricing.calculated

notification.created
notification.sent
```

---

## Payload padrão de eventos

```json
{
  "eventId": "uuid",
  "eventType": "expense.created",
  "occurredAt": "2026-01-01T10:00:00.000Z",
  "data": {}
}
```

---

## Autenticação

* Login retorna JWT.
* Senhas devem ser armazenadas com hash bcrypt.
* Nunca retornar passwordHash.
* API Gateway valida o token.
* Serviços internos podem confiar no Gateway.

---

## Vehicle Service

Status permitidos:

```text
AVAILABLE
IN_MAINTENANCE
READY_TO_SELL
SOLD
```

Regras:

* Veículo vendido deve possuir data de venda.
* Veículo vendido deve publicar evento `vehicle.sold`.
* Veículo vendido não deve receber novas despesas.

---

## Expense Service

Categorias:

```text
MAINTENANCE
DOCUMENTATION
PARTS
TRANSPORT
CLEANING
OTHER
```

Regras:

* Valores não podem ser negativos.
* Deve publicar evento `expense.created`.
* Deve publicar evento `expense.deleted`.

---

## Pricing Service

Responsável pelo cálculo financeiro.

Fórmula oficial:

```text
totalInvestment = purchasePrice + totalExpenses

suggestedPrice =
totalInvestment +
(totalInvestment * profitMargin / 100)

expectedProfit =
suggestedPrice - totalInvestment
```

Regras:

* purchasePrice >= 0
* totalExpenses >= 0
* profitMargin >= 0
* resultado arredondado para 2 casas decimais

---

## Report Service

Deve exibir pelo menos:

* Quantidade total de veículos
* Quantidade de veículos vendidos
* Total investido
* Total de despesas
* Lucro esperado
* Lucro realizado

Preferencialmente consumir eventos ao invés de consultar todos os serviços.

---

## Notification Service

Tecnologia obrigatória:

```text
Firebase Cloud Messaging (FCM)
```

Responsabilidades:

* Receber eventos via RabbitMQ.
* Enviar notificações push.
* Salvar histórico de notificações.
* Gerenciar tokens FCM dos dispositivos.

Eventos consumidos:

```text
vehicle.created
vehicle.sold
expense.created
```

Exemplos:

```text
"Veículo vendido com sucesso."

"Nova despesa cadastrada."

"Veículo está há mais de 60 dias no estoque."
```

Regras:

* Nenhum outro serviço pode enviar notificações diretamente.
* Todo envio deve passar pelo Notification Service.
* Falhas do Firebase não podem derrubar o sistema.
* Os tokens FCM devem ser persistidos em banco.

---

## Docker

Cada serviço deve possuir:

```text
Dockerfile
```

O projeto deve possuir:

```text
docker-compose.yml
```

Portas sugeridas:

```text
frontend: 3000
gateway: 3001

auth-service: 3002
vehicle-service: 3003
expense-service: 3004
pricing-service: 3005
report-service: 3006
notification-service: 3007

rabbitmq: 5672
rabbitmq-management: 15672

postgres: 5432
```

---

## Commits

Padrão:

```text
feat: add vehicle endpoint
fix: correct pricing calculation
refactor: improve notification service
chore: configure rabbitmq
```

---

## Fluxos mínimos

### Cadastro e Login

```text
Usuário cria conta
↓
Usuário faz login
↓
Sistema retorna JWT
```

### Cadastro de Veículo

```text
Usuário cadastra veículo
↓
Vehicle Service salva
↓
Evento vehicle.created
```

### Cadastro de Despesa

```text
Usuário registra despesa
↓
Expense Service salva
↓
Evento expense.created
↓
Notification Service recebe
↓
Firebase envia push
```

### Cálculo de Preço

```text
Pricing Service
↓
Consulta Vehicle Service
↓
Consulta Expense Service
↓
Calcula preço sugerido
↓
Retorna resultado
```

### Venda de Veículo

```text
Vehicle Service
↓
Marca veículo como vendido
↓
Publica vehicle.sold
↓
Report Service atualiza indicadores
↓
Notification Service envia push
```

---

## Critério principal

O backend deve demonstrar claramente um sistema distribuído:

* Múltiplos processos independentes.
* Comunicação por rede.
* Comunicação síncrona e assíncrona.
* RabbitMQ.
* Firebase.
* Responsabilidades separadas.
* Funcionamento integrado como uma única aplicação para o usuário final.
