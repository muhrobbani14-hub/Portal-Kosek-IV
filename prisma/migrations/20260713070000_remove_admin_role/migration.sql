DROP TABLE IF EXISTS "audit_logs";

DROP INDEX IF EXISTS "users_role_isActive_idx";

ALTER TABLE "users" DROP COLUMN IF EXISTS "role";

DROP TYPE IF EXISTS "UserRole";

CREATE INDEX IF NOT EXISTS "users_isActive_idx" ON "users"("isActive");
