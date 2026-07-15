"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  EditableTableCellMap,
  EditableTableColumn,
  EditableTableRow,
} from "@/lib/portal-editable-tables";

const previewLimit = 4;

type EditableOperationPlanGroup = {
  title: string;
  tableKey: string;
  rows: EditableTableRow[];
};

type EditingOperation = {
  tableKey: string;
  periodTitle: string;
  rowKey: string;
  displayOrder: number;
  cells: EditableTableCellMap;
  isExisting: boolean;
};

type EditableOperationPlanGroupsProps = {
  columns: EditableTableColumn[];
  groups: EditableOperationPlanGroup[];
};

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `operation-${Date.now()}`;
}

function emptyCells(columns: EditableTableColumn[]) {
  return Object.fromEntries(
    columns.map((column) => [column.key, ""]),
  );
}

export function EditableOperationPlanGroups({
  columns,
  groups,
}: EditableOperationPlanGroupsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedPeriods, setExpandedPeriods] = useState<
    Record<string, boolean>
  >({});
  const [editingOperation, setEditingOperation] =
    useState<EditingOperation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startAdd(group: EditableOperationPlanGroup) {
    setErrorMessage(null);
    setEditingOperation({
      tableKey: group.tableKey,
      periodTitle: group.title,
      rowKey: createRowKey(),
      displayOrder: group.rows.length + 1,
      cells: emptyCells(columns),
      isExisting: false,
    });
  }

  function startEdit(
    group: EditableOperationPlanGroup,
    row: EditableTableRow,
  ) {
    setErrorMessage(null);
    setEditingOperation({
      tableKey: group.tableKey,
      periodTitle: group.title,
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      cells: { ...emptyCells(columns), ...row.cells },
      isExisting: true,
    });
  }

  async function saveOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingOperation) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/portal-table-rows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey: editingOperation.tableKey,
        rowKey: editingOperation.rowKey,
        displayOrder: editingOperation.displayOrder,
        cells: editingOperation.cells,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Data operasi gagal disimpan.");
      return;
    }

    setEditingOperation(null);
    startTransition(() => router.refresh());
  }

  async function deleteOperation(
    group: EditableOperationPlanGroup,
    row: EditableTableRow,
  ) {
    if (!window.confirm("Hapus kegiatan operasi ini?")) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/portal-table-rows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey: group.tableKey,
        rowKey: row.rowKey,
        displayOrder: row.displayOrder,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Kegiatan operasi gagal dihapus.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {groups.map((group) => {
          const isExpanded = expandedPeriods[group.tableKey] ?? false;
          const hasMoreRows = group.rows.length > previewLimit;
          const visibleRows = isExpanded
            ? group.rows
            : group.rows.slice(0, previewLimit);

          return (
            <article
              key={group.tableKey}
              className="rounded-[6px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5"
            >
              <div className="rounded-[4px] border border-yellow-300/40 bg-[#0b2d66] px-4 py-3 text-center shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
                <h3 className="text-base font-black uppercase tracking-[0.08em] text-yellow-100 sm:text-lg">
                  {group.title}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
                  {group.rows.length} kegiatan
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <p className="text-xs font-semibold text-slate-200/90">
                  Kelola kegiatan operasi pada periode ini.
                </p>
                <button
                  type="button"
                  onClick={() => startAdd(group)}
                  disabled={isPending}
                  className="shrink-0 rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-3 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#071225] transition hover:bg-yellow-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tambah
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {visibleRows.length ? (
                  visibleRows.map((row) => (
                    <section
                      key={row.rowKey}
                      className="overflow-hidden rounded-[4px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-yellow-300/30 bg-[#071f4b] px-4 py-2">
                        <h4 className="text-sm font-black uppercase leading-5 tracking-[0.04em] text-yellow-100 sm:text-base">
                          {row.cells.title || "Kegiatan Operasi"}
                        </h4>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(group, row)}
                            disabled={isPending}
                            className="rounded-[3px] border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteOperation(group, row)}
                            disabled={isPending}
                            className="rounded-[3px] border border-red-300/45 bg-red-700/90 px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      <ul className="space-y-1 px-5 py-3 text-sm font-bold leading-5 text-[#071a33]">
                        {columns
                          .filter((column) => column.key !== "title")
                          .map((column) => (
                            <li key={`${row.rowKey}-${column.key}`}>
                              <span className="mr-1 text-[#0b2d66]">-</span>
                              <span>{column.label} : </span>
                              <span className="font-black text-[#061225]">
                                {row.cells[column.key] || "-"}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </section>
                  ))
                ) : (
                  <p className="rounded-[4px] border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm font-semibold text-slate-200">
                    Belum ada kegiatan pada periode ini.
                  </p>
                )}
              </div>

              {hasMoreRows ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPeriods((current) => ({
                      ...current,
                      [group.tableKey]: !isExpanded,
                    }))
                  }
                  className="mt-4 w-full rounded-[4px] border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-slate-100 transition hover:border-yellow-300/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-200"
                >
                  {isExpanded
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua Kegiatan (${group.rows.length})`}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      {editingOperation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void saveOperation(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                  {editingOperation.isExisting
                    ? "Edit Kegiatan"
                    : "Tambah Kegiatan"}
                </h3>
                <p className="mt-1 text-xs font-semibold text-yellow-100/80">
                  {editingOperation.periodTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOperation(null)}
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className={column.key === "title" ? "block md:col-span-2" : "block"}
                  >
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      {column.label}
                    </span>
                    <textarea
                      value={editingOperation.cells[column.key] ?? ""}
                      onChange={(event) =>
                        setEditingOperation((current) =>
                          current
                            ? {
                                ...current,
                                cells: {
                                  ...current.cells,
                                  [column.key]: event.target.value,
                                },
                              }
                            : current,
                        )
                      }
                      rows={column.key === "title" ? 2 : 3}
                      required
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-xs font-medium leading-5 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
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
