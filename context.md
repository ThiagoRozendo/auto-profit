# Contexto do Backend - AutoProfit

## Visão geral do projeto

O AutoProfit é um sistema distribuído para gestão de revendas de veículos. O objetivo principal é permitir que uma loja ou vendedor cadastre carros comprados para revenda, registre todos os custos associados a cada veículo e obtenha automaticamente uma sugestão de preço de venda com base na margem de lucro desejada.

O sistema deve ser apresentado como um conjunto de módulos/processos distribuídos, executando de forma independente e se comunicando por rede. Para o usuário final, a aplicação deve parecer um sistema único e coerente, mas internamente será composta por serviços separados.

## Problema que o sistema resolve

Revendedores de carros precisam controlar o valor investido em cada veículo antes da venda. Além do valor de compra, existem gastos adicionais como manutenção, troca de peças, documentação, transporte, lavagem, pintura e outros serviços. Sem controle, o vendedor pode vender com margem baixa ou até tomar prejuízo.

O AutoProfit centraliza essas informações e calcula o preço sugerido de venda.

Exemplo:

```text
Valor de compra do carro: R$ 30.000,00
Custos adicionais: R$ 2.500,00
Investimento total: R$ 32.500,00
Margem desejada: 20%
Preço sugerido: R$ 39.000,00
```

## Objetivo acadêmico

O projeto deve atender à proposta da disciplina de Sistemas Distribuídos. Por isso, o backend não deve ser feito como uma única API monolítica. Ele deve ser organizado em módulos independentes, preferencialmente microsserviços, cada um executando em seu próprio processo.

Cada módulo deve ter responsabilidade clara, interface própria e comunicação com outros módulos usando HTTP/REST e, quando aplicável, comunicação assíncrona por mensageria.

## Arquitetura geral

A arquitetura proposta é baseada em microsserviços com API Gateway.

```text
Frontend
   |
   v
API Gateway
   |
   |-----------------------------
   |                             |
   v                             v
Auth Service              Vehicle Service
Expense Service           Pricing Service
Report Service            Notification Service
```

Também pode existir um broker de mensagens, como RabbitMQ, para comunicação assíncrona entre alguns módulos.

```text
Vehicle Service / Expense Service / Sales Flow
                  |
                  v
              RabbitMQ
                  |
        ---------------------
        |                   |
        v                   v
 Report Service     Notification Service
```

## Módulos do sistema

### 1. API Gateway

Responsável por ser o ponto único de entrada do backend.

Funções principais:

- Receber as requisições do frontend.
- Encaminhar requisições para os serviços corretos.
- Validar token JWT quando necessário.
- Agregar respostas de múltiplos serviços, se necessário.
- Esconder do frontend os endereços internos dos microsserviços.

Exemplo de responsabilidade:

```text
GET /cars/:id/details
```

O Gateway pode buscar dados do Vehicle Service, Expense Service e Pricing Service e devolver uma resposta única ao frontend.

### 2. Auth Service

Responsável por usuários, autenticação e autorização.

Funções principais:

- Cadastro de usuários.
- Login.
- Geração de JWT.
- Validação de credenciais.
- Controle básico de perfil de acesso.

Entidades principais:

- User

Campos sugeridos:

```text
id
name
email
passwordHash
role
createdAt
updatedAt
```

### 3. Vehicle Service

Responsável pelo cadastro e gestão dos veículos.

Funções principais:

- Cadastrar carro.
- Editar carro.
- Listar carros.
- Buscar carro por ID.
- Alterar status do carro.
- Marcar carro como vendido.

Entidade principal:

- Vehicle

Campos sugeridos:

```text
id
brand
model
year
plate
purchasePrice
status
observations
createdAt
updatedAt
```

Status sugeridos:

```text
AVAILABLE
IN_MAINTENANCE
READY_TO_SELL
SOLD
```

### 4. Expense Service

Responsável pelos custos associados aos veículos.

Funções principais:

- Registrar despesa de um carro.
- Listar despesas de um carro.
- Remover despesa.
- Calcular total de despesas de um carro.

Entidade principal:

- Expense

Campos sugeridos:

```text
id
vehicleId
description
category
amount
expenseDate
createdAt
updatedAt
```

Categorias sugeridas:

```text
MAINTENANCE
DOCUMENTATION
CLEANING
TRANSPORT
PARTS
OTHER
```

### 5. Pricing Service

Responsável pelo cálculo de preço sugerido, margem e lucro esperado.

Funções principais:

- Calcular investimento total de um veículo.
- Aplicar margem de lucro.
- Retornar preço sugerido de venda.
- Permitir definir margem padrão.
- Permitir simulação com margem personalizada.

Cálculo base:

```text
investimentoTotal = valorCompra + totalDespesas
precoSugerido = investimentoTotal + (investimentoTotal * margemLucro / 100)
lucroEsperado = precoSugerido - investimentoTotal
```

Exemplo de resposta:

```json
{
  "vehicleId": "uuid",
  "purchasePrice": 30000,
  "totalExpenses": 2500,
  "totalInvestment": 32500,
  "profitMargin": 20,
  "suggestedPrice": 39000,
  "expectedProfit": 6500
}
```

### 6. Report Service

Responsável por relatórios e indicadores financeiros.

Funções principais:

- Total de carros cadastrados.
- Total de carros vendidos.
- Total investido em estoque.
- Lucro esperado total.
- Lucro realizado em vendas.
- Ranking de carros com maior custo.
- Relatório por período.

Esse serviço pode consumir eventos de outros serviços para manter dados resumidos.

Exemplo de evento consumido:

```text
vehicle.created
expense.created
vehicle.sold
```

### 7. Notification Service

Responsável pelo envio e gerenciamento de notificações.

Funções principais:

- Enviar notificações push utilizando Firebase Cloud Messaging (FCM).
- Notificar quando um gasto alto for registrado.
- Notificar quando um veículo for vendido.
- Notificar quando um veículo permanecer muito tempo em estoque.
- Registrar histórico de notificações enviadas.
- Gerenciar tokens de dispositivos.

Tecnologias:

- Firebase Cloud Messaging (FCM)
- NestJS
- PostgreSQL

Eventos consumidos:

expense.created
vehicle.sold
vehicle.created

Exemplos de notificações:

- "Novo gasto de R$ 5.000 registrado no veículo Civic."
- "Veículo Corolla foi vendido com sucesso."
- "Veículo Gol está há mais de 60 dias no estoque."

### 8. Frontend

Embora este arquivo seja focado no backend, o frontend conta como um módulo do sistema. Ele será responsável pela interface gráfica exigida pelo professor.

Funções principais:

- Login.
- Cadastro e listagem de veículos.
- Cadastro de despesas.
- Visualização do preço sugerido.
- Visualização de relatórios.
- Visualização de notificações.

## Comunicação entre módulos

### Comunicação síncrona

A comunicação síncrona será feita via HTTP/REST.

Exemplos:

```text
Gateway -> Auth Service
Gateway -> Vehicle Service
Gateway -> Expense Service
Pricing Service -> Vehicle Service
Pricing Service -> Expense Service
```

Uso recomendado:

- Buscar dados imediatamente.
- Validar informações antes de responder ao usuário.
- Consultar preço sugerido sob demanda.

### Comunicação assíncrona

A comunicação assíncrona pode ser feita com RabbitMQ.

Exemplos de eventos:

```text
vehicle.created
vehicle.updated
vehicle.sold
expense.created
expense.deleted
pricing.calculated
notification.created
```

Uso recomendado:

- Atualizar relatórios.
- Gerar notificações.
- Evitar acoplamento direto entre serviços.
- Demonstrar middleware orientado a mensagens.

## Banco de dados

Para facilitar o desenvolvimento, cada serviço pode ter seu próprio banco PostgreSQL ou seu próprio schema/tabelas. O ideal em microsserviços é que cada serviço seja dono dos seus próprios dados.

Modelo recomendado para a disciplina:

```text
Auth Service -> auth_db
Vehicle Service -> vehicle_db
Expense Service -> expense_db
Pricing Service -> pricing_db ou sem banco próprio
Report Service -> report_db
Notification Service -> notification_db
```

Se o grupo quiser simplificar, pode usar um único PostgreSQL com tabelas separadas, desde que os serviços continuem sendo processos separados.

## Stack principal

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Docker Compose
- RabbitMQ opcional, mas recomendado
- JWT para autenticação

## Requisitos funcionais gerais

- O usuário deve conseguir se cadastrar e fazer login.
- O usuário deve conseguir cadastrar veículos.
- O usuário deve conseguir editar veículos.
- O usuário deve conseguir listar veículos.
- O usuário deve conseguir registrar despesas em um veículo.
- O usuário deve conseguir visualizar o total investido em um veículo.
- O usuário deve conseguir definir uma margem de lucro.
- O sistema deve calcular o preço sugerido de venda.
- O usuário deve conseguir marcar um carro como vendido.
- O sistema deve gerar relatórios financeiros básicos.
- O sistema deve gerar notificações para eventos relevantes.

## Requisitos não funcionais

- O sistema deve ser modular.
- Cada módulo backend deve executar como processo independente.
- Os módulos devem se comunicar por rede.
- O sistema deve ter interface gráfica.
- O código deve estar versionado em repositório Git.
- O projeto deve ser executável localmente com Docker Compose.
- As APIs devem seguir padrão REST.
- O backend deve validar dados de entrada.
- O backend deve tratar erros de forma padronizada.
- O sistema deve usar variáveis de ambiente para configurações sensíveis.

## Distribuição sugerida da equipe

### Integrante 1

- API Gateway
- Notification Service

### Integrante 2

- Frontend
- Auth Service

### Integrante 3

- Vehicle Service
- Expense Service

### Integrante 4

- Pricing Service
- Report Service

## Como defender como sistema distribuído

O sistema pode ser defendido como distribuído porque é composto por vários processos independentes, executando módulos separados e comunicando-se por mensagens via rede.

O usuário enxerga apenas uma aplicação única, mas internamente o sistema possui diferentes serviços cooperando para cumprir o objetivo geral.

Pontos para destacar na apresentação:

- Cada serviço tem responsabilidade própria.
- Cada serviço pode rodar em uma porta diferente.
- A comunicação entre serviços acontece por HTTP/REST.
- Alguns fluxos podem usar RabbitMQ para comunicação assíncrona.
- O API Gateway centraliza a entrada do sistema.
- O frontend não precisa conhecer diretamente todos os serviços.
- O sistema pode ser executado em containers Docker.
- A arquitetura facilita manutenção, escalabilidade e separação de responsabilidades.
