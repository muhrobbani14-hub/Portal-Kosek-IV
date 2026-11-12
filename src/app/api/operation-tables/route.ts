import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import {
  OPERATION_CUSTOM_TABLES_KEY,
  OPERATION_FIXED_TABLE_KEYS,
} from "@/lib/operation-custom-tables";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function readJsonBody(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (session instanceof NextResponse) {
    return session;
  }

  if (!session) {
    return jsonError("Akses admin diperlukan untuk membuat tabel.", 403);
  }

  const body = await readJsonBody(request);
  const title =
    typeof body?.title === "string" ? body.title.trim() : "";

  if (!title || title.length > 100) {
    return jsonError("Judul tabel wajib diisi (maksimal 100 karakter).");
  }

  try {
    const latestDefinition = await prisma.portalTableRow.findFirst({
      where: {
        tableKey: OPERATION_CUSTOM_TABLES_KEY,
      },
      orderBy: {
        displayOrder: "desc",
      },
      select: {
        displayOrder: true,
      },
    });

    const id = randomUUID();
    await prisma.portalTableRow.create({
      data: {
        tableKey: OPERATION_CUSTOM_TABLES_KEY,
        rowKey: id,
        cells: {
          title,
        },
        displayOrder: (latestDefinition?.displayOrder ?? 0) + 1,
      },
    });

    return NextResponse.json(
      { message: "Tabel Operasi berhasil dibuat.", id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create custom operation table API error:", error);
    return jsonError("Terjadi gangguan saat membuat tabel Operasi.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (session instanceof NextResponse) {
    return session;
  }

  if (!session) {
    return jsonError("Akses admin diperlukan untuk menghapus tabel.", 403);
  }

  const body = await readJsonBody(request);
  const tableKey =
    typeof body?.tableKey === "string" ? body.tableKey.trim() : "";
  const customTableMatch = tableKey.match(
    /^operation-custom:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
  );
  const isFixedTable = OPERATION_FIXED_TABLE_KEYS.some(
    (key) => key === tableKey,
  );

  if (!customTableMatch && !isFixedTable) {
    return jsonError("Tabel Operasi tidak valid.");
  }

  try {
    await prisma.$transaction(async (transaction) => {
      if (isFixedTable) {
        await transaction.portalTableRow.deleteMany({
          where: { tableKey },
        });
        await transaction.portalTableRow.upsert({
          where: {
            tableKey_rowKey: {
              tableKey: OPERATION_CUSTOM_TABLES_KEY,
              rowKey: tableKey,
            },
          },
          create: {
            tableKey: OPERATION_CUSTOM_TABLES_KEY,
            rowKey: tableKey,
            cells: { title: tableKey },
            displayOrder: 0,
            isDeleted: true,
          },
          update: {
            isDeleted: true,
          },
        });
        return;
      }

      if (!customTableMatch) {
        throw new Error("Invalid operation table key after validation.");
      }

      const id = customTableMatch[1];
      const definition = await transaction.portalTableRow.findUnique({
        where: {
          tableKey_rowKey: {
            tableKey: OPERATION_CUSTOM_TABLES_KEY,
            rowKey: id,
          },
        },
        select: {
          id: true,
          isDeleted: true,
        },
      });

      if (!definition || definition.isDeleted) {
        return;
      }

      await transaction.portalTableRow.deleteMany({
        where: {
          tableKey: `operation-custom:${id}`,
        },
      });
      await transaction.portalTableRow.update({
        where: { id: definition.id },
        data: { isDeleted: true },
      });
    });

    return NextResponse.json({ message: "Tabel Operasi berhasil dihapus." });
  } catch (error) {
    console.error("Delete operation table API error:", error);
    return jsonError("Terjadi gangguan saat menghapus tabel Operasi.", 500);
  }
}
