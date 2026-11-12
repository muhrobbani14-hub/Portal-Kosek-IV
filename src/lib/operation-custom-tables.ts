import "server-only";

import { prisma } from "@/lib/prisma";
import type { EditableTableRow } from "@/lib/portal-editable-tables";
import { OPERATION_TABLE_COLUMNS } from "@/lib/operation-table-columns";

export const OPERATION_CUSTOM_TABLES_KEY = "operation-custom-table-definitions";
export const OPERATION_FIXED_TABLE_KEYS = [
  "operation-plans-ta-2025",
  "operation-plans-tw-1-ta-2026",
] as const;

export type OperationCustomTable = {
  id: string;
  title: string;
  columns: typeof OPERATION_TABLE_COLUMNS;
  rows: EditableTableRow[];
};

function readTableDefinition(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const cells = value as Record<string, unknown>;

  return typeof cells.title === "string"
    ? { title: cells.title }
    : null;
}

function readCells(value: unknown) {
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

export async function getOperationCustomTables(): Promise<OperationCustomTable[]> {
  const definitions = await prisma.portalTableRow.findMany({
    where: {
      tableKey: OPERATION_CUSTOM_TABLES_KEY,
      isDeleted: false,
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: {
      rowKey: true,
      cells: true,
    },
  });

  const tables: Array<OperationCustomTable | null> = await Promise.all(
    definitions.map(async (definition) => {
      const parsed = readTableDefinition(definition.cells);

      if (!parsed) {
        console.error(
          `Invalid custom operation table definition: ${definition.rowKey}`,
        );
        return null;
      }

      const tableKey = `operation-custom:${definition.rowKey}`;
      const savedRows = await prisma.portalTableRow.findMany({
        where: {
          tableKey,
          isDeleted: false,
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          rowKey: true,
          cells: true,
          displayOrder: true,
        },
      });

      return {
        id: definition.rowKey,
        title: parsed.title,
        columns: OPERATION_TABLE_COLUMNS,
        rows: savedRows.map((row) => ({
          id: row.id,
          rowKey: row.rowKey,
          cells: readCells(row.cells),
          displayOrder: row.displayOrder,
        })),
      };
    }),
  );

  return tables.filter((table) => table !== null);
}

export async function getDeletedOperationFixedTableKeys() {
  const deletedTables = await prisma.portalTableRow.findMany({
    where: {
      tableKey: OPERATION_CUSTOM_TABLES_KEY,
      rowKey: { in: [...OPERATION_FIXED_TABLE_KEYS] },
      isDeleted: true,
    },
    select: {
      rowKey: true,
    },
  });

  return new Set(deletedTables.map((table) => table.rowKey));
}
