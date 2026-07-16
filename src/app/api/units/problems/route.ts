import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/permissions";
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

async function readJsonBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
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

export async function DELETE(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (!session) {
    return jsonError("Akses admin diperlukan untuk menghapus data.", 403);
  }

  const body = await readJsonBody(request);
  const problemId =
    typeof body?.problemId === "string" ? body.problemId.trim() : "";

  if (!problemId) {
    return jsonError("Permasalahan tidak valid.");
  }

  try {
    const problem = await prisma.unitProblem.findUnique({
      where: {
        id: problemId,
      },
      select: {
        id: true,
        imageUrl: true,
        actions: {
          select: {
            attachmentUrl: true,
          },
        },
      },
    });

    if (!problem) {
      return jsonError("Permasalahan tidak ditemukan.", 404);
    }

    await prisma.$transaction([
      prisma.problemAction.deleteMany({
        where: {
          problemId: problem.id,
        },
      }),
      prisma.unitProblem.delete({
        where: {
          id: problem.id,
        },
      }),
    ]);

    await deleteSavedUnitImage(problem.imageUrl);

    await Promise.all(
      problem.actions.map((action) =>
        deleteSavedUnitImage(action.attachmentUrl),
      ),
    );

    return NextResponse.json({
      message: "Permasalahan berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete unit problem API error:", error);

    return jsonError(
      "Terjadi gangguan saat menghapus permasalahan.",
      500,
    );
  }
}
