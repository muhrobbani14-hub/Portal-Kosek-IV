CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');

ALTER TABLE "users"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'VIEWER';

UPDATE "users"
SET "role" = 'ADMIN';

CREATE INDEX IF NOT EXISTS "users_role_isActive_idx" ON "users"("role", "isActive");
