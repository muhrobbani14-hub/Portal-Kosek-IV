import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

type PersonnelRow = [
  no: string,
  nama: string,
  pangkat: string,
  korps: string,
  nrpNip: string,
  jabatan: string,
  tempatTanggalLahir?: string,
  pangkatTmt?: string,
  jurusan?: string,
  jawatan?: string,
];

type ParsedDocument = {
  tableKey: string;
  rowKeyPrefix: string;
  unitSlug?: string;
  categorySlug: string;
  fileName: string;
  rows: PersonnelRow[];
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readerScriptPath = path.join(repoRoot, "scripts", "read-unit-personnel-documents.ps1");

function getConnectionString() {
  const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL atau NEON_DATABASE_URL belum dikonfigurasi.");
  }

  return connectionString;
}

function readPersonnelDocuments(): ParsedDocument[] {
  if (!existsSync(readerScriptPath)) {
    throw new Error(`Script pembaca dokumen tidak ditemukan: ${readerScriptPath}`);
  }

  const shell = process.platform === "win32" ? "powershell" : "pwsh";
  const output = execFileSync(
    shell,
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", readerScriptPath],
    {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20,
    },
  );

  return JSON.parse(output) as ParsedDocument[];
}

function toCells(row: PersonnelRow) {
  const [
    no,
    nama,
    pangkat,
    korps,
    nrpNip,
    jabatan,
    tempatTanggalLahir = "",
    pangkatTmt = "",
    jurusan = "",
    jawatan = "",
  ] = row;

  return {
    no,
    nama,
    tempatTanggalLahir,
    pangkat,
    pangkatTmt,
    korps,
    jurusan,
    nrpNip,
    jabatan,
    jawatan,
  };
}

async function main() {
  const documents = readPersonnelDocuments();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: getConnectionString(),
    }),
  });

  let createdCount = 0;
  let skippedCount = 0;

  try {
    for (const document of documents) {
      const tableKey = document.tableKey;

      for (const [index, row] of document.rows.entries()) {
        const rowKey = `${document.rowKeyPrefix}${row[0]}`;
        const existingRow = await prisma.portalTableRow.findUnique({
          where: {
            tableKey_rowKey: {
              tableKey,
              rowKey,
            },
          },
          select: {
            id: true,
          },
        });

        if (existingRow) {
          skippedCount += 1;
          continue;
        }

        await prisma.portalTableRow.create({
          data: {
            tableKey,
            rowKey,
            displayOrder: index + 1,
            cells: toCells(row),
          },
        });
        createdCount += 1;
      }

      console.log(`${tableKey}: ${document.rows.length} baris diproses`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Selesai. Dibuat: ${createdCount}, dilewati karena sudah ada: ${skippedCount}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
