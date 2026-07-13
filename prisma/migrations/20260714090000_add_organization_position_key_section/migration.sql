DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'OrganizationSection'
  ) THEN
    CREATE TYPE "OrganizationSection" AS ENUM (
      'PIMPINAN',
      'STAF_PEMBANTU_PIMPINAN',
      'STAF_PELAYANAN',
      'PELAKSANA'
    );
  END IF;
END $$;

ALTER TABLE "organization_positions"
ADD COLUMN IF NOT EXISTS "key" TEXT;

ALTER TABLE "organization_positions"
ADD COLUMN IF NOT EXISTS "section" "OrganizationSection";

UPDATE "organization_positions"
SET "key" = "id"
WHERE "key" IS NULL;

UPDATE "organization_positions"
SET "section" = 'PELAKSANA'
WHERE "section" IS NULL;

ALTER TABLE "organization_positions"
ALTER COLUMN "key" SET NOT NULL;

ALTER TABLE "organization_positions"
ALTER COLUMN "section" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "organization_positions_key_key"
ON "organization_positions"("key");

CREATE INDEX IF NOT EXISTS "organization_positions_section_displayOrder_idx"
ON "organization_positions"("section", "displayOrder");
