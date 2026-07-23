import "server-only";

import { getEditableTableRows } from "@/lib/portal-editable-tables";
import { personnelCategories } from "@/lib/personnel-data";
import type { PersonnelOption } from "@/lib/personnel-option-types";

function readCell(cells: Record<string, string>, key: string) {
  return cells[key]?.trim() ?? "";
}

function parseBirthPlaceDate(value: string) {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(/^(.*?),\s*(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);

  if (!match) {
    return {
      birthPlace: normalizedValue,
      birthDate: "",
    };
  }

  const [, birthPlace, dayValue, monthValue, yearValue] = match;
  const year = yearValue.length === 2 ? `19${yearValue}` : yearValue;
  const month = monthValue.padStart(2, "0");
  const day = dayValue.padStart(2, "0");

  return {
    birthPlace: birthPlace.trim(),
    birthDate: `${year}-${month}-${day}`,
  };
}

function toPersonnelOption(
  tableKey: string,
  category: string,
  row: Awaited<ReturnType<typeof getEditableTableRows>>[number],
): PersonnelOption | null {
  const name = readCell(row.cells, "nama");

  if (!name) {
    return null;
  }

  const rank = readCell(row.cells, "pangkat");
  const nrp = readCell(row.cells, "nrpNip");
  const positionTitle = readCell(row.cells, "jabatan");
  const jawatan = readCell(row.cells, "jawatan");
  const { birthPlace, birthDate } = parseBirthPlaceDate(
    readCell(row.cells, "tempatTanggalLahir"),
  );
  const labelParts = [rank, name, positionTitle].filter(Boolean);

  return {
    id: `${tableKey}:${row.rowKey}`,
    label: labelParts.join(" - "),
    category,
    name,
    rank,
    nrp,
    positionTitle,
    birthPlace,
    birthDate,
    education: readCell(row.cells, "education"),
    careerHistory: jawatan,
    photoUrl: readCell(row.cells, "photoUrl"),
  };
}

export async function getPersonnelOptionsByTableKeys(
  tableKeys: Array<{ tableKey: string; category: string }>,
): Promise<PersonnelOption[]> {
  const optionGroups = await Promise.all(
    tableKeys.map(async ({ tableKey, category }) => {
      const rows = await getEditableTableRows(tableKey, []);

      return rows
        .map((row) => toPersonnelOption(tableKey, category, row))
        .filter((option): option is PersonnelOption => option !== null);
    }),
  );

  return optionGroups.flat();
}

export async function getKosekPersonnelOptions() {
  return getPersonnelOptionsByTableKeys(
    personnelCategories.map((category) => ({
      tableKey: `personnel-${category.slug}`,
      category: category.title,
    })),
  );
}

export async function getUnitPersonnelOptions(unitSlug: string) {
  return getPersonnelOptionsByTableKeys(
    personnelCategories.map((category) => ({
      tableKey: `unit:${unitSlug}:personel:${category.slug}`,
      category: category.title,
    })),
  );
}
