import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteSavedUnitImage,
  ImageUploadError,
  saveUnitImage,
} from "@/lib/uploads/unit-image";

const problemStatusValues = [
  "REPORTED",
  "IN_PROGRESS",
  "WAITING_SUPPORT",
  "WAITING_PART",
  "COMPLETED",
  "CLOSED",
] as const;

type ProblemStatusValue = (typeof problemStatusValues)[number];

function readOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : null;
}

function readOptionalDate(formData: FormData, key: string) {
  const value = readOptionalText(formData, key);

  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function readStatus(formData: FormData): ProblemStatusValue {
  const status = readOptionalText(formData, "status");

  return problemStatusValues.includes(status as ProblemStatusValue)
    ? (status as ProblemStatusValue)
    : "REPORTED";
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
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.isActive === false) {
    return jsonError("Sesi login tidak valid.", 401);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data formulir tidak valid.");
  }

  const unitId = readOptionalText(formData, "unitId");
  const problemId = readOptionalText(formData, "problemId");
  const title = readOptionalText(formData, "title");
  const description = readOptionalText(formData, "description");

  if (!unitId) {
    return jsonError("Unit tidak valid.");
  }

  if (!title) {
    return jsonError("Judul permasalahan wajib diisi.");
  }

  if (!description) {
    return jsonError("Deskripsi permasalahan wajib diisi.");
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
      },
    });

    if (!unit) {
      return jsonError("Unit tidak ditemukan.", 404);
    }

    if (uploadedImage) {
      const savedImage = await saveUnitImage(uploadedImage);
      savedImageUrl = savedImage.publicUrl;
    }

    const problemData = {
      title,
      description,
      occurredAt: readOptionalDate(formData, "occurredAt"),
      status: readStatus(formData),
      ...(savedImageUrl
        ? {
            imageUrl: savedImageUrl,
          }
        : {}),
    };

    if (problemId) {
      const existingProblem =
        await prisma.unitProblem.findUnique({
          where: {
            id: problemId,
          },
          select: {
            id: true,
            unitId: true,
            imageUrl: true,
          },
        });

      if (!existingProblem || existingProblem.unitId !== unit.id) {
        if (savedImageUrl) {
          await deleteSavedUnitImage(savedImageUrl);
        }

        return jsonError("Permasalahan tidak ditemukan.", 404);
      }

      await prisma.unitProblem.update({
        where: {
          id: existingProblem.id,
        },
        data: problemData,
      });

      if (savedImageUrl) {
        await deleteSavedUnitImage(existingProblem.imageUrl);
      }
    } else {
      const latestProblem = await prisma.unitProblem.findFirst({
        where: {
          unitId: unit.id,
        },
        orderBy: {
          displayOrder: "desc",
        },
        select: {
          displayOrder: true,
        },
      });

      await prisma.unitProblem.create({
        data: {
          ...problemData,
          displayOrder: (latestProblem?.displayOrder ?? 0) + 1,
          unitId: unit.id,
        },
      });
    }

    return NextResponse.json({
      message: "Permasalahan berhasil disimpan.",
    });
  } catch (error) {
    if (savedImageUrl) {
      await deleteSavedUnitImage(savedImageUrl);
    }

    if (error instanceof ImageUploadError) {
      return jsonError(error.message);
    }

    console.error("Save unit problem API error:", error);

    return jsonError(
      "Terjadi gangguan saat menyimpan permasalahan.",
      500,
    );
  }
}
