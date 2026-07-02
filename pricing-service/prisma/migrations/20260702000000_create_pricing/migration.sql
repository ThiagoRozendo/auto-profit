CREATE SCHEMA IF NOT EXISTS "pricing";

-- CreateTable
CREATE TABLE "pricing"."PricingRule" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "defaultProfitMargin" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."PricingCalculation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "purchasePriceSnapshot" DECIMAL(12,2) NOT NULL,
    "totalExpensesSnapshot" DECIMAL(12,2) NOT NULL,
    "totalInvestment" DECIMAL(12,2) NOT NULL,
    "profitMargin" DECIMAL(5,2) NOT NULL,
    "suggestedPrice" DECIMAL(12,2) NOT NULL,
    "expectedProfit" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingRule_userId_key" ON "pricing"."PricingRule"("userId");

-- CreateIndex
CREATE INDEX "PricingRule_userId_idx" ON "pricing"."PricingRule"("userId");

-- CreateIndex
CREATE INDEX "PricingCalculation_userId_idx" ON "pricing"."PricingCalculation"("userId");

-- CreateIndex
CREATE INDEX "PricingCalculation_vehicleId_idx" ON "pricing"."PricingCalculation"("vehicleId");

-- CreateIndex
CREATE INDEX "PricingCalculation_createdAt_idx" ON "pricing"."PricingCalculation"("createdAt");
