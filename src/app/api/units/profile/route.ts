import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import {
  deleteSavedUnitImage,
  ImageUploadError,
  saveUnitImage,
} from "@/lib/uploads/unit-image";

function readOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : null;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readOptionalText(formData, key);

  if (!value) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function readImage(formData: FormData) {
  const image = formData.get("image");

  if (!(image instanceof File) || image.size <= 0) {
    return null;
  }

  return image;
}

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

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return jsonError("Akses admin diperlukan untuk mengubah data.", 403);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data formulir tidak valid.");
  }

  const unitId = readOptionalText(formData, "unitId");
  const code = readOptionalText(formData, "code");
  const name = readOptionalText(formData, "name");

  if (!unitId) {
    return jsonError("Unit tidak valid.");
  }

  if (!code) {
    return jsonError("Kode unit wajib diisi.");
  }

  if (!name) {
    return jsonError("Nama unit wajib diisi.");
  }

  const uploadedImage = readImage(formData);
  let savedImageUrl: string | null = null;

  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id: unitId,
      },
      select: {
        id: true,
        code: true,
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

    if (uploadedImage) {
      const savedImage = await saveUnitImage(uploadedImage);
      savedImageUrl = savedImage.publicUrl;
    }

    await prisma.unit.update({
      where: {
        id: unit.id,
      },
      data: {
        code,
        name,
        equipmentName: readOptionalText(
          formData,
          "equipmentName",
        ),
        installationYear: readOptionalNumber(
          formData,
          "installationYear",
        ),
        psrCondition: readOptionalText(
          formData,
          "psrCondition",
        ),
        psrRange: readOptionalText(formData, "psrRange"),
        ssrCondition: readOptionalText(
          formData,
          "ssrCondition",
        ),
        ssrRange: readOptionalText(formData, "ssrRange"),
        description: readOptionalText(
          formData,
          "description",
        ),
        ...(savedImageUrl
          ? {
              imageUrl: savedImageUrl,
            }
          : {}),
      },
    });

    if (savedImageUrl) {
      await deleteSavedUnitImage(unit.imageUrl);
    }

    return NextResponse.json({
      message: "Data unit berhasil disimpan.",
    });
  } catch (error) {
    if (savedImageUrl) {
      await deleteSavedUnitImage(savedImageUrl);
    }

    if (error instanceof ImageUploadError) {
      return jsonError(error.message);
    }

    console.error("Save unit profile API error:", error);

    return jsonError(
      "Terjadi gangguan saat menyimpan data unit.",
      500,
    );
  }
}
