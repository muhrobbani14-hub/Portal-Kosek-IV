import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
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

function readRequiredDate(formData: FormData, key: string) {
  const value = readOptionalText(formData, key);

  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
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

  const problemId = readOptionalText(formData, "problemId");
  const actionId = readOptionalText(formData, "actionId");
  const actionDate = readRequiredDate(formData, "actionDate");
  const description = readOptionalText(formData, "description");
  const uploadedImage = readImage(formData);
  let savedImageUrl: string | null = null;

  if (!problemId) {
    return jsonError("Permasalahan tidak valid.");
  }

  if (!actionDate) {
    return jsonError("Tanggal upaya wajib diisi.");
  }

  if (!description) {
    return jsonError("Deskripsi upaya wajib diisi.");
  }

  try {
    const problem = await prisma.unitProblem.findUnique({
      where: {
        id: problemId,
      },
      select: {
        id: true,
      },
    });

    if (!problem) {
      return jsonError("Permasalahan tidak ditemukan.", 404);
    }

    if (uploadedImage) {
      const savedImage = await saveUnitImage(uploadedImage);
      savedImageUrl = savedImage.publicUrl;
    }

    const actionData = {
      actionDate,
      description,
      letterNumber: readOptionalText(formData, "letterNumber"),
      result: readOptionalText(formData, "result"),
      ...(savedImageUrl
        ? {
            attachmentUrl: savedImageUrl,
          }
        : {}),
    };

    if (actionId) {
      const existingAction =
        await prisma.problemAction.findUnique({
          where: {
            id: actionId,
          },
          select: {
            id: true,
            problemId: true,
            attachmentUrl: true,
          },
        });

      if (!existingAction || existingAction.problemId !== problem.id) {
        if (savedImageUrl) {
          await deleteSavedUnitImage(savedImageUrl);
        }

        return jsonError("Upaya penanganan tidak ditemukan.", 404);
      }

      await prisma.problemAction.update({
        where: {
          id: existingAction.id,
        },
          data: actionData,
      });

      if (savedImageUrl) {
        await deleteSavedUnitImage(existingAction.attachmentUrl);
      }
    } else {
      const latestAction = await prisma.problemAction.findFirst({
        where: {
          problemId: problem.id,
        },
        orderBy: {
          sequence: "desc",
        },
        select: {
          sequence: true,
        },
      });

      await prisma.problemAction.create({
        data: {
          ...actionData,
          sequence: (latestAction?.sequence ?? 0) + 1,
          problemId: problem.id,
        },
      });
    }

    return NextResponse.json({
      message: "Upaya penanganan berhasil disimpan.",
    });
  } catch (error) {
    if (savedImageUrl) {
      await deleteSavedUnitImage(savedImageUrl);
    }

    if (error instanceof ImageUploadError) {
      return jsonError(error.message);
    }

    console.error("Save problem action API error:", error);

    return jsonError(
      "Terjadi gangguan saat menyimpan upaya penanganan.",
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.isActive === false) {
    return jsonError("Sesi login tidak valid.", 401);
  }

  const body = await readJsonBody(request);
  const actionId =
    typeof body?.actionId === "string" ? body.actionId.trim() : "";

  if (!actionId) {
    return jsonError("Upaya penanganan tidak valid.");
  }

  try {
    const action = await prisma.problemAction.findUnique({
      where: {
        id: actionId,
      },
      select: {
        id: true,
        attachmentUrl: true,
      },
    });

    if (!action) {
      return jsonError("Upaya penanganan tidak ditemukan.", 404);
    }

    await prisma.problemAction.delete({
      where: {
        id: action.id,
      },
    });

    await deleteSavedUnitImage(action.attachmentUrl);

    return NextResponse.json({
      message: "Upaya penanganan berhasil dihapus.",
    });
  } catch (error) {
    console.error("Delete problem action API error:", error);

    return jsonError(
      "Terjadi gangguan saat menghapus upaya penanganan.",
      500,
    );
  }
}
