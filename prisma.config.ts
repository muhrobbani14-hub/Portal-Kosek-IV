import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const databaseUrl =
  process.env.SUPABASE_DIRECT_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.NEON_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "SUPABASE_DIRECT_URL, SUPABASE_DATABASE_URL, NEON_DATABASE_URL, atau DATABASE_URL belum dikonfigurasi.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },

  datasource: {
    url: databaseUrl,
  },
});