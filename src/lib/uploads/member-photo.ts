import "server-only";

import { randomUUID } from "node:crypto";
import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MEMBER_UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "uploads",
  "members",
);

function shouldStoreAsDataUrl() {
  return process.env.VERCEL === "1";
}

export class MemberPhotoUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberPhotoUploadError";
  }
}

export async function saveMemberPhoto(file: File) {
  if (file.size <= 0) {
    throw new MemberPhotoUploadError(
      "File foto belum dipilih.",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new MemberPhotoUploadError(
      "Ukuran foto maksimal 5 MB.",
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new MemberPhotoUploadError(
      "Format foto harus JPG, PNG, atau WebP.",
    );
  }

  const inputBuffer = Buffer.from(
    await file.arrayBuffer(),
  );

  let processedBuffer: Buffer;

  try {
    processedBuffer = await sharp(inputBuffer, {
      failOn: "warning",
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: 900,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
      })
      .toBuffer();
  } catch (error) {
    console.error("Sharp member photo error:", error);

    throw new MemberPhotoUploadError(
      "File tidak dapat diproses sebagai foto yang valid.",
    );
  }

  if (shouldStoreAsDataUrl()) {
    return `data:image/webp;base64,${processedBuffer.toString("base64")}`;
  }

  await mkdir(MEMBER_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const fileName = `${randomUUID()}.webp`;
  const absolutePath = path.join(
    MEMBER_UPLOAD_DIRECTORY,
    fileName,
  );

  await writeFile(absolutePath, processedBuffer);

  return `/uploads/members/${fileName}`;
}

export async function deleteSavedMemberPhoto(
  photoUrl: string | null,
) {
  if (!photoUrl?.startsWith("/uploads/members/")) {
    return;
  }

  const fileName = path.basename(photoUrl);
  const absolutePath = path.join(
    MEMBER_UPLOAD_DIRECTORY,
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

    console.error("Gagal menghapus foto member:", error);
  }
}
