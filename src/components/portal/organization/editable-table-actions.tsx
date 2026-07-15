"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  EditableTableCellMap,
  EditableTableColumn,
  EditableTableRow,
} from "@/lib/portal-editable-tables";

type EditableTableActionsProps = {
  tableKey: string;
  columns: EditableTableColumn[];
  row?: EditableTableRow;
  nextDisplayOrder?: number;
};

type EditingRow = {
  rowKey: string;
  displayOrder: number;
  cells: EditableTableCellMap;
};

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}`;
}

function emptyCells(columns: EditableTableColumn[]) {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

export function EditableTableActions({
  tableKey,
  columns,
  row,
  nextDisplayOrder,
}: EditableTableActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const blankCells = useMemo(() => emptyCells(columns), [columns]);
  const isAddControl = !row;
  const isCompactForm = true;

  function startAdd() {
    setErrorMessage(null);
    setEditingRow({
      rowKey: createRowKey(),
      displayOrder: nextDisplayOrder ?? 1,
      cells: blankCells,
    });
  }

  function startEdit() {
    if (!row) {
      return;
    }

    setErrorMessage(null);
    setEditingRow({
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      cells: { ...blankCells, ...row.cells },
    });
  }

  async function saveRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRow) {
      return;
    }

    setErrorMessage(null);
    const response = await fetch("/api/portal-table-rows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey,
        rowKey: editingRow.rowKey,
        displayOrder: editingRow.displayOrder,
        cells: editingRow.cells,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Data tabel gagal disimpan.");
      return;
    }

    setEditingRow(null);
    startTransition(() => router.refresh());
  }

  async function deleteRow() {
    if (!row || !window.confirm("Hapus baris tabel ini?")) {
      return;
    }

    setErrorMessage(null);
    const response = await fetch("/api/portal-table-rows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey,
        rowKey: row.rowKey,
        displayOrder: row.displayOrder,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Baris tabel gagal dihapus.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      {isAddControl ? (
        <button
          type="button"
          onClick={startAdd}
          disabled={isPending}
          className="shrink-0 rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] transition hover:bg-yellow-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tambah Baris
        </button>
      ) : (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={startEdit}
            disabled={isPending}
            className="rounded-[4px] border border-[#0b2d66]/35 bg-white/75 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-[0.06em] text-[#071a33] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2d66] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => void deleteRow()}
            disabled={isPending}
            className="rounded-[4px] border border-red-500/45 bg-red-700 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hapus
          </button>
        </div>
      )}

      {editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void saveRow(event)}
            className={[
              "flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]",
              isCompactForm ? "max-w-3xl" : "max-w-4xl",
            ].join(" ")}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                {row ? "Edit Baris" : "Tambah Baris"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="rounded-[4px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10"
              >
                Batal
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              {errorMessage ? (
                <p className="mb-4 rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100">
                  {errorMessage}
                </p>
              ) : null}

              <div
                className={[
                  "grid grid-cols-1 md:grid-cols-2",
                  isCompactForm ? "gap-3 xl:grid-cols-3" : "gap-4",
                ].join(" ")}
              >
                {columns.map((column) => (
                  <label key={column.key} className="block">
                    <span
                      className={[
                        "mb-2 block font-black uppercase tracking-[0.1em] text-yellow-100",
                        isCompactForm ? "text-[10px]" : "text-xs",
                      ].join(" ")}
                    >
                      {column.label}
                    </span>
                    <textarea
                      value={editingRow.cells[column.key] ?? ""}
                      onChange={(event) =>
                        setEditingRow((currentRow) =>
                          currentRow
                            ? {
                                ...currentRow,
                                cells: {
                                  ...currentRow.cells,
                                  [column.key]: event.target.value,
                                },
                              }
                            : currentRow,
                        )
                      }
                      rows={isCompactForm ? 2 : 4}
                      className={[
                        "w-full rounded-[4px] border border-white/15 bg-white px-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40",
                        isCompactForm
                          ? "py-2 text-xs font-medium leading-5"
                          : "py-2.5 text-sm font-medium leading-6",
                      ].join(" ")}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-white/10 bg-[#061225] px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-[#071225] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
