-- Runtime compatibility for Prisma client access through the public schema.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type type
    JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
    WHERE type.typname = 'VehicleStatus'
      AND namespace.nspname = 'public'
  ) THEN
    CREATE TYPE public."VehicleStatus" AS ENUM (
      'AVAILABLE',
      'RESERVED',
      'IN_MAINTENANCE',
      'SOLD'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE namespace.nspname = 'public'
      AND class.relname = 'Vehicle'
      AND class.relkind = 'v'
  ) THEN
    DROP VIEW public."Vehicle";
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public."Vehicle" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT NOT NULL,
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "status" public."VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "observations" TEXT,
    "soldAt" TIMESTAMP(3),
    "salePrice" DECIMAL(12,2),
    "saleNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_plate_key" ON public."Vehicle"("plate");
CREATE INDEX IF NOT EXISTS "Vehicle_ownerId_idx" ON public."Vehicle"("ownerId");
CREATE INDEX IF NOT EXISTS "Vehicle_status_idx" ON public."Vehicle"("status");
CREATE INDEX IF NOT EXISTS "Vehicle_plate_idx" ON public."Vehicle"("plate");

INSERT INTO public."Vehicle" (
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
  "status"::text::public."VehicleStatus",
  "observations",
  "soldAt",
  "salePrice",
  "saleNotes",
  "createdAt",
  "updatedAt"
FROM vehicle."Vehicle"
ON CONFLICT ("id") DO NOTHING;
