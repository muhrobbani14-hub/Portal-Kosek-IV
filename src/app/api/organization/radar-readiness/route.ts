import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { unlink } from "node:fs/promises";

import { requireAdminRequest } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_IMAGE_PATTERN =
  /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_DATA_IMAGE_LENGTH = 4_500_000;
const UNIT_UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "uploads",
  "units",
);

type RadarReadinessPayload = {
  unitId?: unknown;
  code?: unknown;
  name?: unknown;
  equipmentName?: unknown;
  installationYear?: unknown;
  psrCondition?: unknown;
  psrRange?: unknown;
  ssrCondition?: unknown;
  ssrRange?: unknown;
  description?: unknown;
  imageDataUrl?: unknown;
  removeImage?: unknown;
};

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

function readOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : null;
}

function readOptionalNumber(value: unknown) {
  const textValue = readOptionalText(value);

  if (!textValue) {
    return null;
  }

  const parsedValue = Number(textValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function readImageDataUrl(value: unknown) {
  const imageDataUrl = readOptionalText(value);

  if (!imageDataUrl) {
    return null;
  }

  if (imageDataUrl.length > MAX_DATA_IMAGE_LENGTH) {
    throw new Error("Ukuran foto masih terlalu besar.");
  }

  if (!DATA_IMAGE_PATTERN.test(imageDataUrl)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP.");
  }

  return imageDataUrl;
}

async function deleteSavedUnitImage(imageUrl: string | null) {
  if (!imageUrl?.startsWith("/uploads/units/")) {
    return;
  }

  const fileName = path.basename(imageUrl);
  const absolutePath = path.join(
    UNIT_UPLOAD_DIRECTORY,
    fileName,
  );

  try {
    await unlink(absolutePath);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    console.error("Gagal menghapus foto unit lama:", error);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return jsonError("Akses admin diperlukan untuk mengubah data.", 403);
  }

  let payload: RadarReadinessPayload;

  try {
    payload = (await request.json()) as RadarReadinessPayload;
  } catch {
    return jsonError("Data formulir tidak valid.");
  }

  const unitId = readOptionalText(payload.unitId);
  const code = readOptionalText(payload.code);
  const name = readOptionalText(payload.name);

  if (!unitId) {
    return jsonError("Unit tidak valid.");
  }

  if (!code) {
    return jsonError("Kode unit wajib diisi.");
  }

  if (!name) {
    return jsonError("Nama unit wajib diisi.");
  }

  let imageDataUrl: string | null = null;
  const shouldRemoveImage = payload.removeImage === true;

  try {
    imageDataUrl = readImageDataUrl(payload.imageDataUrl);
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Foto tidak dapat diproses.",
    );
  }

  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id: unitId,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!unit) {
      return jsonError("Unit tidak ditemukan.", 404);
    }

    const duplicateUnit = await prisma.unit.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

    if (duplicateUnit && duplicateUnit.id !== unit.id) {
      return jsonError("Kode unit tersebut sudah digunakan.");
    }

    await prisma.unit.update({
      where: {
        id: unit.id,
      },
      data: {
        code,
        name,
        equipmentName: readOptionalText(payload.equipmentName),
        installationYear: readOptionalNumber(
          payload.installationYear,
        ),
        psrCondition: readOptionalText(payload.psrCondition),
        psrRange: readOptionalText(payload.psrRange),
        ssrCondition: readOptionalText(payload.ssrCondition),
        ssrRange: readOptionalText(payload.ssrRange),
        description: readOptionalText(payload.description),
        imageUrl: shouldRemoveImage
          ? null
          : imageDataUrl ?? unit.imageUrl,
      },
    });

    if (imageDataUrl || shouldRemoveImage) {
      await deleteSavedUnitImage(unit.imageUrl);
    }

    return NextResponse.json({
      message: "Data kesiapan radar berhasil disimpan.",
    });
  } catch (error) {
    console.error("Save radar readiness API error:", error);

    return jsonError(
      "Terjadi gangguan saat menyimpan data kesiapan radar.",
      500,
    );
  }
}
