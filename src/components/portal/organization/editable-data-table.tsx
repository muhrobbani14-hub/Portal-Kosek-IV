"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  EditableTableCellMap,
  EditableTableColumn,
  EditableTableRow,
} from "@/lib/portal-editable-tables";

type EditableDataTableProps = {
  tableKey: string;
  columns: EditableTableColumn[];
  rows: EditableTableRow[];
};

type EditingRow = {
  rowKey: string;
  displayOrder: number;
  cells: EditableTableCellMap;
};

function createEmptyCells(columns: EditableTableColumn[]) {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}`;
}

export function EditableDataTable({
  tableKey,
  columns,
  rows,
}: EditableDataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emptyCells = useMemo(() => createEmptyCells(columns), [columns]);

  function startAddRow() {
    setErrorMessage(null);
    setEditingRow({
      rowKey: createRowKey(),
      displayOrder: rows.length + 1,
      cells: emptyCells,
    });
  }

  function startEditRow(row: EditableTableRow) {
    setErrorMessage(null);
    setEditingRow({
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      cells: {
        ...emptyCells,
        ...row.cells,
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
    startTransition(() => {
      router.refresh();
    });
  }

  async function deleteRow(row: EditableTableRow) {
    const shouldDelete = window.confirm(
      "Hapus baris tabel ini?",
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/portal-table-rows", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
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

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200/90">
          Data dapat ditambah, diedit, dan dihapus langsung dari halaman ini.
        </p>
        <button
          type="button"
          onClick={startAddRow}
          disabled={isPending}
          className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tambah Baris
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-[4px] border border-red-300/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-[#072966] text-white">
                <th className="w-20 border-r border-white/25 px-5 py-4 text-center text-base font-black uppercase tracking-[0.12em]">
                  No
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="border-r border-white/25 px-6 py-4 text-center text-base font-black uppercase tracking-[0.12em] last:border-r-0"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="w-44 px-5 py-4 text-center text-base font-black uppercase tracking-[0.12em]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.rowKey}
                  className={[
                    "border-t border-white/70 text-slate-950",
                    index % 2 === 0 ? "bg-[#ffe4bf]/95" : "bg-[#fff4e6]/95",
                  ].join(" ")}
                >
                  <td className="w-20 border-r border-white/80 px-5 py-5 align-top text-center text-lg font-bold">
                    {index + 1}.
                  </td>
                  {columns.map((column) => (
                    <td
                      key={`${row.rowKey}-${column.key}`}
                      className="whitespace-pre-line border-r border-white/80 px-6 py-5 align-top text-base font-semibold leading-7 last:border-r-0"
                    >
                      {row.cells[column.key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-5 align-top">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditRow(row)}
                        disabled={isPending}
                        className="rounded-[4px] border border-slate-300/70 bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteRow(row)}
                        disabled={isPending}
                        className="rounded-[4px] border border-red-400/50 bg-red-700 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void saveRow(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                {rows.some((row) => row.rowKey === editingRow.rowKey)
                  ? "Edit Baris"
                  : "Tambah Baris"}
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {columns.map((column) => (
                  <label key={column.key} className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
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
                      rows={2}
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      required
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-white/10 bg-[#061225] px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
