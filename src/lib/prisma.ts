import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum dikonfigurasi.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString,
});

const cachedPrisma = globalForPrisma.prisma;
const cachedPrismaIsCurrent =
  cachedPrisma &&
  "portalTableRow" in cachedPrisma &&
  typeof cachedPrisma.portalTableRow?.findMany === "function";

export const prisma = cachedPrismaIsCurrent
  ? cachedPrisma
  : new PrismaClient({
      adapter,
    });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
