import { NextRequest, NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import {
  deleteSavedMemberPhoto,
  MemberPhotoUploadError,
  saveMemberPhoto,
} from "@/lib/uploads/member-photo";

function readOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length ? trimmedValue : null;
}

function readBirthDate(formData: FormData) {
  const value = readOptionalText(formData, "birthDate");

  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function readPhoto(formData: FormData) {
  const photo = formData.get("photo");

  if (!(photo instanceof File) || photo.size <= 0) {
    return null;
  }

  return photo;
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

  const positionKey = readOptionalText(formData, "positionKey");
  const fullName = readOptionalText(formData, "fullName");
  const positionTitle = readOptionalText(formData, "positionTitle");

  if (!positionKey) {
    return jsonError("Posisi struktur tidak valid.");
  }

  if (!fullName) {
    return jsonError("Nama lengkap wajib diisi.");
  }

  if (!positionTitle) {
    return jsonError("Jabatan wajib diisi.");
  }

  const serviceNumber = readOptionalText(
    formData,
    "serviceNumber",
  );

  const uploadedPhoto = readPhoto(formData);
  let savedPhotoUrl: string | null = null;

  try {
    const position = await prisma.organizationPosition.findUnique({
      where: {
        key: positionKey,
      },
      select: {
        id: true,
        title: true,
        member: {
          select: {
            id: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!position) {
      return jsonError("Posisi struktur tidak ditemukan.", 404);
    }

    if (uploadedPhoto) {
      savedPhotoUrl = await saveMemberPhoto(uploadedPhoto);
    }

    const duplicateMember = serviceNumber
      ? await prisma.member.findUnique({
          where: {
            serviceNumber,
          },
          select: {
            id: true,
          },
        })
      : null;

    if (
      duplicateMember &&
      duplicateMember.id !== position.member?.id
    ) {
      if (savedPhotoUrl) {
        await deleteSavedMemberPhoto(savedPhotoUrl);
      }

      return jsonError("NRP tersebut sudah digunakan biodata lain.");
    }

    const memberData = {
      fullName,
      serviceNumber,
      rank: readOptionalText(formData, "rank"),
      positionTitle,
      birthPlace: readOptionalText(formData, "birthPlace"),
      birthDate: readBirthDate(formData),
      education: readOptionalText(formData, "education"),
      description: readOptionalText(formData, "description"),
      status: "ACTIVE" as const,
      ...(savedPhotoUrl
        ? {
            photoUrl: savedPhotoUrl,
          }
        : {}),
    };

    if (position.member) {
      await prisma.$transaction([
        prisma.organizationPosition.update({
          where: {
            id: position.id,
          },
          data: {
            title: positionTitle,
          },
        }),
        prisma.member.update({
          where: {
            id: position.member.id,
          },
          data: memberData,
        }),
      ]);

      if (savedPhotoUrl) {
        await deleteSavedMemberPhoto(position.member.photoUrl);
      }
    } else {
      const member = await prisma.member.create({
        data: memberData,
        select: {
          id: true,
        },
      });

      await prisma.organizationPosition.update({
        where: {
          id: position.id,
        },
        data: {
          title: positionTitle,
          memberId: member.id,
        },
      });
    }

    return NextResponse.json({
      message: "Biodata dan jabatan berhasil disimpan.",
    });
  } catch (error) {
    if (savedPhotoUrl) {
      await deleteSavedMemberPhoto(savedPhotoUrl);
    }

    if (error instanceof MemberPhotoUploadError) {
      return jsonError(error.message);
    }

    console.error("Save organization profile API error:", error);

    return jsonError(
      "Terjadi gangguan saat menyimpan biodata.",
      500,
    );
  }
}
