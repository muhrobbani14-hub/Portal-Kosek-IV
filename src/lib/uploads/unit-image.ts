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

const UNIT_UPLOAD_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "uploads",
  "units",
);

function shouldStoreAsDataUrl() {
  return process.env.VERCEL === "1";
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export type SavedUnitImage = {
  publicUrl: string;
  absolutePath: string;
};

export async function saveUnitImage(
  file: File,
): Promise<SavedUnitImage> {
  if (file.size <= 0) {
    throw new ImageUploadError(
      "File gambar belum dipilih.",
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageUploadError(
      "Ukuran gambar maksimal 5 MB.",
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ImageUploadError(
      "Format gambar harus JPG, PNG, atau WebP.",
    );
  }

  const inputBuffer = Buffer.from(
    await file.arrayBuffer(),
  );

  let processedBuffer: Buffer;

  try {
    processedBuffer = await sharp(inputBuffer, {
      failOn: "warning",

      // Maksimal sekitar 40 megapiksel.
      limitInputPixels: 40_000_000,
    })
      // Mengikuti orientasi EXIF gambar.
      .rotate()
      .resize({
        width: 1600,
        height: 1000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
      })
      .toBuffer();
  } catch (error) {
    console.error("Sharp image processing error:", error);

    throw new ImageUploadError(
      "File tidak dapat diproses sebagai gambar yang valid.",
    );
  }

  if (shouldStoreAsDataUrl()) {
    return {
      publicUrl: `data:image/webp;base64,${processedBuffer.toString("base64")}`,
      absolutePath: "",
    };
  }

  await mkdir(UNIT_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const fileName = `${randomUUID()}.webp`;

  const absolutePath = path.join(
    UNIT_UPLOAD_DIRECTORY,
    fileName,
  );

  await writeFile(absolutePath, processedBuffer);

  return {
    publicUrl: `/uploads/units/${fileName}`,
    absolutePath,
  };
}

export async function deleteSavedUnitImage(
  imageUrl: string | null,
) {
  if (!imageUrl?.startsWith("/uploads/units/")) {
    return;
  }

  // basename mencegah path traversal.
  const fileName = path.basename(imageUrl);

  const absolutePath = path.join(
    UNIT_UPLOAD_DIRECTORY,
    fileName,
  );

  await deleteFileSafely(absolutePath);
}

export async function deleteFileSafely(
  absolutePath: string,
) {
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

    console.error("Gagal menghapus file gambar:", error);
  }
}
