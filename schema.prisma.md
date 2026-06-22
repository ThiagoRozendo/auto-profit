```ts
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  schemas  = ["auth", "vehicle", "expense", "pricing", "report", "notification"]
}

// ======================================================
// AUTH SERVICE
// Schema PostgreSQL: auth
// Responsável por usuários, login, senha e JWT.
// ======================================================

enum UserRole {
  ADMIN
  MANAGER
  SELLER

  @@schema("auth")
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(SELLER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
  @@schema("auth")
}

// ======================================================
// VEHICLE SERVICE
// Schema PostgreSQL: vehicle
// Responsável pelo cadastro, edição, listagem e venda de veículos.
// Não deve ter relação direta com User.
// ownerId é apenas o UUID do usuário autenticado recebido pelo Gateway.
// ======================================================

enum VehicleStatus {
  AVAILABLE       // disponível
  RESERVED        // reservado
  IN_MAINTENANCE  // manutenção
  SOLD            // vendido

  @@schema("vehicle")
}

model Vehicle {
  id            String        @id @default(uuid()) @db.Uuid
  ownerId       String        @db.Uuid
  brand         String
  model         String
  year          Int
  plate         String        @unique
  purchasePrice Decimal       @db.Decimal(12, 2)
  status        VehicleStatus @default(AVAILABLE)
  observations  String?
  soldAt        DateTime?
  salePrice     Decimal?      @db.Decimal(12, 2)
  saleNotes     String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([ownerId])
  @@index([status])
  @@index([plate])
  @@schema("vehicle")
}

// ======================================================
// EXPENSE SERVICE
// Schema PostgreSQL: expense
// Responsável pelas despesas dos veículos.
// Não deve ter relação direta com Vehicle.
// vehicleId é apenas o UUID do veículo recebido pela API.
// vehicleLabel é opcional para facilitar exibição no front.
// ======================================================

enum ExpenseCategory {
  MAINTENANCE
  DOCUMENTATION
  CLEANING
  TRANSPORT
  PARTS
  OTHER

  @@schema("expense")
}

model Expense {
  id          String          @id @default(uuid()) @db.Uuid
  userId      String          @db.Uuid
  vehicleId   String          @db.Uuid
  vehicleLabel String?
  description String
  category    ExpenseCategory @default(OTHER)
  amount      Decimal         @db.Decimal(12, 2)
  expenseDate DateTime        @default(now())
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId])
  @@index([vehicleId])
  @@index([category])
  @@index([expenseDate])
  @@schema("expense")
}

// ======================================================
// PRICING SERVICE
// Schema PostgreSQL: pricing
// Responsável por regras de margem e histórico de cálculos.
// Pode funcionar sem banco, mas estas tabelas ajudam o front
// a salvar margem padrão e histórico de precificação.
// ======================================================

model PricingRule {
  id                  String   @id @default(uuid()) @db.Uuid
  userId              String   @unique @db.Uuid
  defaultProfitMargin Decimal  @default(18.00) @db.Decimal(5, 2)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@schema("pricing")
}

model PricingCalculation {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @db.Uuid
  vehicleId             String   @db.Uuid
  purchasePriceSnapshot Decimal  @db.Decimal(12, 2)
  totalExpensesSnapshot Decimal  @db.Decimal(12, 2)
  totalInvestment       Decimal  @db.Decimal(12, 2)
  profitMargin          Decimal  @db.Decimal(5, 2)
  suggestedPrice        Decimal  @db.Decimal(12, 2)
  expectedProfit        Decimal  @db.Decimal(12, 2)
  createdAt             DateTime @default(now())

  @@index([userId])
  @@index([vehicleId])
  @@index([createdAt])
  @@schema("pricing")
}

// ======================================================
// REPORT SERVICE
// Schema PostgreSQL: report
// Responsável por dados consolidados, indicadores e gráficos.
// Pode consumir eventos e salvar snapshots.
// ======================================================

model ReportSnapshot {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @db.Uuid
  totalVehicles         Int      @default(0)
  availableVehicles     Int      @default(0)
  reservedVehicles      Int      @default(0)
  inMaintenanceVehicles Int      @default(0)
  soldVehicles          Int      @default(0)
  totalInvestment       Decimal  @default(0) @db.Decimal(12, 2)
  totalExpenses         Decimal  @default(0) @db.Decimal(12, 2)
  expectedProfit        Decimal  @default(0) @db.Decimal(12, 2)
  realizedProfit        Decimal  @default(0) @db.Decimal(12, 2)
  generatedAt           DateTime @default(now())

  @@index([userId])
  @@index([generatedAt])
  @@schema("report")
}

model MonthlyFinancialMetric {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @db.Uuid
  month          DateTime @db.Date
  totalExpenses  Decimal  @default(0) @db.Decimal(12, 2)
  expectedProfit Decimal  @default(0) @db.Decimal(12, 2)
  realizedProfit Decimal  @default(0) @db.Decimal(12, 2)
  vehiclesSold   Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, month])
  @@index([userId])
  @@schema("report")
}

model ExpenseCategoryMetric {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  category    String
  totalAmount Decimal  @default(0) @db.Decimal(12, 2)
  count       Int      @default(0)
  generatedAt DateTime @default(now())

  @@index([userId])
  @@index([category])
  @@schema("report")
}

// ======================================================
// NOTIFICATION SERVICE
// Schema PostgreSQL: notification
// Responsável por notificações internas, histórico e tokens FCM.
// Não deve ter relação direta com User.
// userId é apenas o UUID do usuário autenticado.
// ======================================================

enum NotificationType {
  HIGH_EXPENSE
  VEHICLE_SOLD
  LONG_TIME_IN_STOCK
  GENERAL

  @@schema("notification")
}

enum DevicePlatform {
  WEB
  ANDROID
  IOS

  @@schema("notification")
}

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @db.Uuid
  title     String
  message   String
  type      NotificationType @default(GENERAL)
  read      Boolean          @default(false)
  metadata  Json?
  readAt    DateTime?
  createdAt DateTime         @default(now())

  @@index([userId])
  @@index([userId, read])
  @@index([type])
  @@schema("notification")
}

model DeviceToken {
  id         String         @id @default(uuid()) @db.Uuid
  userId     String         @db.Uuid
  token      String         @unique
  platform   DevicePlatform @default(WEB)
  active     Boolean        @default(true)
  lastUsedAt DateTime?
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@index([userId])
  @@index([active])
  @@schema("notification")
}

model NotificationSettings {
  id                String   @id @default(uuid()) @db.Uuid
  userId            String   @unique @db.Uuid
  highExpenseLimit  Decimal  @default(5000.00) @db.Decimal(12, 2)
  maxDaysInStock    Int      @default(60)
  emailAlerts       Boolean  @default(false)
  pushNotifications Boolean  @default(true)
  weeklySummary     Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@schema("notification")
}
```