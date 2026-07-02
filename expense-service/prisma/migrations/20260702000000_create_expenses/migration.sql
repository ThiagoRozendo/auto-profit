-- Cria o schema expense caso não exista
CREATE SCHEMA IF NOT EXISTS "expense";

-- CreateEnum
CREATE TYPE "expense"."ExpenseCategory" AS ENUM ('MAINTENANCE', 'DOCUMENTATION', 'CLEANING', 'TRANSPORT', 'PARTS', 'OTHER');

-- CreateTable
CREATE TABLE "expense"."Expense" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "vehicleLabel" TEXT,
    "description" TEXT NOT NULL,
    "category" "expense"."ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "amount" DECIMAL(12,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "expense"."Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_vehicleId_idx" ON "expense"."Expense"("vehicleId");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "expense"."Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "expense"."Expense"("expenseDate");
