-- Ensure the dedicated vehicle schema exists for runtime queries.
CREATE SCHEMA IF NOT EXISTS "vehicle";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type type
    JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
    WHERE type.typname = 'VehicleStatus'
      AND namespace.nspname = 'vehicle'
  ) THEN
    CREATE TYPE "vehicle"."VehicleStatus" AS ENUM (
      'AVAILABLE',
      'RESERVED',
      'IN_MAINTENANCE',
      'SOLD'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "vehicle"."Vehicle" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "status" "vehicle"."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "observations" TEXT,
    "soldAt" TIMESTAMP(3),
    "salePrice" DECIMAL(12,2),
    "saleNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_plate_key" ON "vehicle"."Vehicle"("plate");
CREATE INDEX IF NOT EXISTS "Vehicle_ownerId_idx" ON "vehicle"."Vehicle"("ownerId");
CREATE INDEX IF NOT EXISTS "Vehicle_status_idx" ON "vehicle"."Vehicle"("status");
CREATE INDEX IF NOT EXISTS "Vehicle_plate_idx" ON "vehicle"."Vehicle"("plate");

INSERT INTO "vehicle"."Vehicle" (
  "id",
  "ownerId",
  "brand",
  "model",
  "year",
  "plate",
  "purchasePrice",
  "status",
  "observations",
  "soldAt",
  "salePrice",
  "saleNotes",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  "ownerId",
  "brand",
  "model",
  "year",
  "plate",
  "purchasePrice",
  "status"::text::"vehicle"."VehicleStatus",
  "observations",
  "soldAt",
  "salePrice",
  "saleNotes",
  "createdAt",
  "updatedAt"
FROM public."Vehicle"
ON CONFLICT ("id") DO UPDATE
SET
  "ownerId" = EXCLUDED."ownerId",
  "brand" = EXCLUDED."brand",
  "model" = EXCLUDED."model",
  "year" = EXCLUDED."year",
  "plate" = EXCLUDED."plate",
  "purchasePrice" = EXCLUDED."purchasePrice",
  "status" = EXCLUDED."status",
  "observations" = EXCLUDED."observations",
  "soldAt" = EXCLUDED."soldAt",
  "salePrice" = EXCLUDED."salePrice",
  "saleNotes" = EXCLUDED."saleNotes",
  "createdAt" = EXCLUDED."createdAt",
  "updatedAt" = EXCLUDED."updatedAt";
