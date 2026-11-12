import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import readXlsxFile from "read-excel-file/node";
import writeXlsxFile from "write-excel-file/node";

import { requireAdminRequest } from "@/lib/auth/permissions";
import { getPersonnelCategory } from "@/lib/personnel-data";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PERSONNEL_ROWS = 1000;
const MAX_CELL_LENGTH = 500;
const TEMPLATE_HEADERS = [
  "No",
  "Nama",
  "Tempat/Tanggal Lahir",
  "Pangkat",
  "TMT Pangkat",
  "Korps",
  "Jurusan",
  "NRP/NIP",
  "Jabatan",
  "Jawatan",
];
type PersonnelField =
  | "no"
  | "nama"
  | "tempatTanggalLahir"
  | "pangkat"
  | "pangkatTmt"
  | "korps"
  | "jurusan"
  | "nrpNip"
  | "jabatan"
  | "jawatan";

type PersonnelCells = Record<PersonnelField, string>;
type SpreadsheetRows = Awaited<ReturnType<typeof readXlsxFile>>[number]["data"];

const HEADER_FIELDS: Record<string, PersonnelField> = {
  no: "no",
  nomor: "no",
  nama: "nama",
  name: "nama",
  "tempat tanggal lahir": "tempatTanggalLahir",
  "tempat tanggal lahir ttl": "tempatTanggalLahir",
  ttl: "tempatTanggalLahir",
  pangkat: "pangkat",
  "tmt pangkat": "pangkatTmt",
  "pangkat tmt": "pangkatTmt",
  korps: "korps",
  jurusan: "jurusan",
  jur: "jurusan",
  "nrp nip": "nrpNip",
  nrp: "nrpNip",
  nip: "nrpNip",
  jabatan: "jabatan",
  jawatan: "jawatan",
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function normalizeHeader(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function readCellText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function emptyPersonnelCells(): PersonnelCells {
  return {
    no: "",
    nama: "",
    tempatTanggalLahir: "",
    pangkat: "",
    pangkatTmt: "",
    korps: "",
    jurusan: "",
    nrpNip: "",
    jabatan: "",
    jawatan: "",
  };
}

export async function GET(request: NextRequest) {
  const categorySlug = request.nextUrl.searchParams.get("category") ?? "";
  const category = getPersonnelCategory(categorySlug);

  if (!category) {
    return jsonError("Kategori personel tidak valid.");
  }

  const buffer = await writeXlsxFile([TEMPLATE_HEADERS], {
    sheet: "Personel",
  }).toBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-personel-${category.slug}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminRequest(request);

  if (session instanceof NextResponse) {
    return session;
  }

  if (!session) {
    return jsonError("Akses admin diperlukan untuk mengimpor data.", 403);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Read personnel import form error:", error);
    return jsonError("Form impor tidak dapat dibaca.");
  }

  const categorySlug = formData.get("category");
  const category =
    typeof categorySlug === "string"
      ? getPersonnelCategory(categorySlug)
      : undefined;
  const file = formData.get("file");

  if (!category) {
    return jsonError("Kategori personel tidak valid.");
  }

  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".xlsx")) {
    return jsonError("Pilih file Excel berformat .xlsx.");
  }

  if (!file.size || file.size > MAX_FILE_SIZE) {
    return jsonError("Ukuran file harus lebih dari 0 dan maksimal 5 MB.");
  }

  let spreadsheetRows: SpreadsheetRows;

  try {
    const sheets = await readXlsxFile(
      Buffer.from(await file.arrayBuffer()),
    );
    spreadsheetRows = sheets[0]?.data ?? [];
  } catch {
    return jsonError("File Excel tidak valid atau tidak dapat dibuka.");
  }

  if (!spreadsheetRows.length) {
    return jsonError("File Excel tidak memiliki sheet atau baris judul.");
  }

  const columns = new Map<number, PersonnelField>();
  const mappedFields = new Set<PersonnelField>();
  let hasDuplicateHeaders = false;
  const headers = spreadsheetRows[0];
  headers.forEach((value, index) => {
    const header = HEADER_FIELDS[normalizeHeader(readCellText(value))];

    if (header) {
      if (mappedFields.has(header)) {
        hasDuplicateHeaders = true;
      }

      mappedFields.add(header);
      columns.set(index, header);
    }
  });

  if (hasDuplicateHeaders) {
    return jsonError("Terdapat judul kolom personel yang terduplikasi.");
  }

  if (![...columns.values()].includes("nama")) {
    return jsonError(
      "Kolom Nama tidak ditemukan. Gunakan template Excel yang disediakan.",
    );
  }

  const personnelRows: Array<{ rowNumber: number; cells: PersonnelCells }> = [];
  const invalidRows: number[] = [];

  spreadsheetRows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const cells = emptyPersonnelCells();

    for (const [columnIndex, field] of columns) {
      const value = readCellText(row[columnIndex]);

      if (value.length > MAX_CELL_LENGTH) {
        invalidRows.push(rowNumber);
        return;
      }

      cells[field] = value;
    }

    if (Object.values(cells).every((value) => !value)) {
      return;
    }

    if (!cells.nama) {
      invalidRows.push(rowNumber);
      return;
    }

    personnelRows.push({ rowNumber, cells });
  });

  if (spreadsheetRows.length > MAX_PERSONNEL_ROWS + 1) {
    return jsonError(
      `Maksimal ${MAX_PERSONNEL_ROWS} baris personel dapat diimpor sekaligus.`,
    );
  }

  if (invalidRows.length) {
    const preview = invalidRows.slice(0, 10).join(", ");
    const remaining = invalidRows.length > 10 ? " dan baris lainnya" : "";
    return jsonError(
      `Periksa baris ${preview}${remaining}. Nama wajib diisi dan panjang setiap nilai maksimal ${MAX_CELL_LENGTH} karakter.`,
    );
  }

  if (!personnelRows.length) {
    return jsonError("Tidak ada data personel untuk diimpor.");
  }

  const tableKey = `personnel-${category.slug}`;

  try {
    const existingRows = await prisma.portalTableRow.findMany({
      where: {
        tableKey,
        isDeleted: false,
      },
      select: {
        cells: true,
        displayOrder: true,
      },
    });

    const usedNumbers = new Set(
      existingRows.flatMap((row) => {
        if (!row.cells || typeof row.cells !== "object" || Array.isArray(row.cells)) {
          return [];
        }

        const nrpNip = (row.cells as Record<string, unknown>).nrpNip;
        return typeof nrpNip === "string" && nrpNip.trim()
          ? [nrpNip.trim().toLocaleLowerCase("id-ID")]
          : [];
      }),
    );

    let displayOrder =
      existingRows.reduce(
        (highest, row) => Math.max(highest, row.displayOrder),
        0,
      ) + 1;
    let skippedDuplicates = 0;
    const acceptedRows: Array<{
      tableKey: string;
      rowKey: string;
      cells: PersonnelCells;
      displayOrder: number;
    }> = [];

    for (const { cells } of personnelRows) {
      const normalizedNumber = cells.nrpNip.trim().toLocaleLowerCase("id-ID");

      if (normalizedNumber && usedNumbers.has(normalizedNumber)) {
        skippedDuplicates += 1;
        continue;
      }

      if (normalizedNumber) {
        usedNumbers.add(normalizedNumber);
      }

      if (!cells.no) {
        cells.no = String(displayOrder);
      }

      acceptedRows.push({
        tableKey,
        rowKey: randomUUID(),
        cells,
        displayOrder,
      });
      displayOrder += 1;
    }

    if (acceptedRows.length) {
      await prisma.portalTableRow.createMany({
        data: acceptedRows,
      });
    }

    return NextResponse.json({
      message: `${acceptedRows.length} personel berhasil diimpor${
        skippedDuplicates
          ? `, ${skippedDuplicates} baris duplikat NRP/NIP dilewati`
          : ""
      }.`,
      importedCount: acceptedRows.length,
      skippedDuplicateCount: skippedDuplicates,
    });
  } catch (error) {
    console.error("Import personnel spreadsheet API error:", error);
    return jsonError("Terjadi gangguan saat mengimpor data personel.", 500);
  }
}
