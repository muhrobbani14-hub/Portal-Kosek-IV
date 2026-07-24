import "server-only";

import { prisma } from "@/lib/prisma";

export type EditableTableColumn = {
  key: string;
  label: string;
};

export type EditableTableCellMap = Record<string, string>;

export type EditableTableRow = {
  id: string | null;
  rowKey: string;
  cells: EditableTableCellMap;
  displayOrder: number;
};

export type EditableTableDefaultRow = {
  rowKey: string;
  cells: EditableTableCellMap;
};

function readCells(value: unknown): EditableTableCellMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, cellValue]) => [
      key,
      typeof cellValue === "string" ? cellValue : String(cellValue ?? ""),
    ]),
  );
}

export async function getEditableTableRows(
  tableKey: string,
  defaultRows: EditableTableDefaultRow[],
): Promise<EditableTableRow[]> {
  const savedRows = await prisma.portalTableRow.findMany({
    where: {
      tableKey,
    },
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      rowKey: true,
      cells: true,
      displayOrder: true,
      isDeleted: true,
    },
  });

  const savedRowsByKey = new Map(
    savedRows.map((row) => [row.rowKey, row]),
  );

  if (defaultRows.length > 0) {
    const missingDefaultRows = defaultRows.filter(
      (defaultRow) => !savedRowsByKey.has(defaultRow.rowKey),
    );

    if (missingDefaultRows.length > 0) {
      await prisma.portalTableRow.createMany({
        data: missingDefaultRows.map((defaultRow, index) => ({
          tableKey,
          rowKey: defaultRow.rowKey,
          cells: defaultRow.cells,
          displayOrder: defaultRows.findIndex(
            (row) => row.rowKey === defaultRow.rowKey,
          ) + 1 || index + 1,
        })),
        skipDuplicates: true,
      });

      return getEditableTableRows(tableKey, []);
    }
  }

  const defaultRowKeys = new Set(defaultRows.map((row) => row.rowKey));

  const mergedRows = defaultRows.flatMap((defaultRow, index) => {
    const savedRow = savedRowsByKey.get(defaultRow.rowKey);

    if (savedRow?.isDeleted) {
      return [];
    }

    return [
      {
        id: savedRow?.id ?? null,
        rowKey: defaultRow.rowKey,
        cells: savedRow ? readCells(savedRow.cells) : defaultRow.cells,
        displayOrder: savedRow?.displayOrder ?? index + 1,
      },
    ];
  });

  const addedRows = savedRows
    .filter((row) => !defaultRowKeys.has(row.rowKey) && !row.isDeleted)
    .map((row) => ({
      id: row.id,
      rowKey: row.rowKey,
      cells: readCells(row.cells),
      displayOrder: row.displayOrder,
    }));

  return [...mergedRows, ...addedRows].sort((firstRow, secondRow) => {
    if (firstRow.displayOrder !== secondRow.displayOrder) {
      return firstRow.displayOrder - secondRow.displayOrder;
    }

    return firstRow.rowKey.localeCompare(secondRow.rowKey);
  });
}
