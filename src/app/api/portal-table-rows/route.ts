import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      message,
    },
    {
      status,
    },
  );
}

async function readJsonBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readText(body: Record<string, unknown> | null, key: string) {
  const value = body?.[key];

  return typeof value === "string" ? value.trim() : "";
}

function readDisplayOrder(body: Record<string, unknown> | null) {
  const value = body?.displayOrder;

  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
}

function readCells(body: Record<string, unknown> | null) {
  const cells = body?.cells;

  if (!cells || typeof cells !== "object" || Array.isArray(cells)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(cells).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : String(value ?? "").trim(),
    ]),
  );
}

async function requireValidSession(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session && session.user.isActive !== false ? session : null;
}

export async function POST(request: NextRequest) {
  const session = await requireValidSession(request);

  if (!session) {
    return jsonError("Sesi login tidak valid.", 401);
  }

  const body = await readJsonBody(request);
  const tableKey = readText(body, "tableKey");
  const rowKey = readText(body, "rowKey");
  const cells = readCells(body);

  if (!tableKey) {
    return jsonError("Tabel tidak valid.");
  }

  if (!rowKey) {
    return jsonError("Baris tabel tidak valid.");
  }

  if (!cells) {
    return jsonError("Isi tabel tidak valid.");
  }

  try {
    await prisma.portalTableRow.upsert({
      where: {
        tableKey_rowKey: {
          tableKey,
          rowKey,
        },
      },
      create: {
        tableKey,
        rowKey,
        cells,
        displayOrder: readDisplayOrder(body),
      },
      update: {
        cells,
        displayOrder: readDisplayOrder(body),
        isDeleted: false,
      },
    });

    return NextResponse.json({
      message: "Data tabel berhasil disimpan.",
    });
  } catch (error) {
    console.error("Save portal table row API error:", error);

    return jsonError("Terjadi gangguan saat menyimpan tabel.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireValidSession(request);

  if (!session) {
    return jsonError("Sesi login tidak valid.", 401);
  }

  const body = await readJsonBody(request);
  const tableKey = readText(body, "tableKey");
  const rowKey = readText(body, "rowKey");

  if (!tableKey) {
    return jsonError("Tabel tidak valid.");
  }

  if (!rowKey) {
    return jsonError("Baris tabel tidak valid.");
  }

  try {
    await prisma.portalTableRow.upsert({
      where: {
        tableKey_rowKey: {
          tableKey,
          rowKey,
        },
      },
      create: {
        tableKey,
        rowKey,
        cells: {},
        displayOrder: readDisplayOrder(body),
        isDeleted: true,
      },
      update: {
        isDeleted: true,
      },
    });

    return NextResponse.json({
      message: "Baris tabel berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete portal table row API error:", error);

    return jsonError("Terjadi gangguan saat menghapus baris tabel.", 500);
  }
}
