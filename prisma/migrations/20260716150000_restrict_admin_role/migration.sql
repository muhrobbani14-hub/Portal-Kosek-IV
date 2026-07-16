UPDATE "users"
SET "role" = 'ADMIN'
WHERE "username" = 'admin';

UPDATE "users"
SET "role" = 'VIEWER'
WHERE "username" IS NULL OR "username" <> 'admin';
