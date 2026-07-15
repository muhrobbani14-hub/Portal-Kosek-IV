"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { EditableTableRow } from "@/lib/portal-editable-tables";

type OperationHourChartGroup = {
  title: string;
  tableKey: string;
  rows: EditableTableRow[];
};

type EditableOperationHoursChartsProps = {
  groups: OperationHourChartGroup[];
};

type OperationHourRow = {
  rowKey: string;
  displayOrder: number;
  label: string;
  sasbinpuan: number;
  pencapaian: number;
  percent: string;
};

type EditingRow = {
  tableKey: string;
  rowKey: string;
  displayOrder: number;
  label: string;
  sasbinpuan: string;
  pencapaian: string;
  percent: string;
  isExisting: boolean;
};

const maxHourValue = 10000;

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `operation-hours-${Date.now()}`;
}

function parseHourValue(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(
    value.replace(/\./g, "").replace(",", ".").trim(),
  );

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatPercent(value: number) {
  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })} %`;
}

function getPercent(row: {
  sasbinpuan: number;
  pencapaian: number;
  percent: string;
}) {
  if (row.percent.trim()) {
    return row.percent;
  }

  if (row.sasbinpuan <= 0) {
    return "0 %";
  }

  return formatPercent((row.pencapaian / row.sasbinpuan) * 100);
}

function barHeight(value: number) {
  return `${Math.max((value / maxHourValue) * 100, value > 0 ? 2 : 0)}%`;
}

function toOperationRow(row: EditableTableRow): OperationHourRow {
  return {
    rowKey: row.rowKey,
    displayOrder: row.displayOrder,
    label: row.cells.label ?? "",
    sasbinpuan: parseHourValue(row.cells.sasbinpuan),
    pencapaian: parseHourValue(row.cells.pencapaian),
    percent: row.cells.percent ?? "",
  };
}

export function EditableOperationHoursCharts({
  groups,
}: EditableOperationHoursChartsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingRow, setEditingRow] = useState<EditingRow | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  const parsedGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        rows: group.rows.map(toOperationRow),
      })),
    [groups],
  );

  function startAdd(tableKey: string, rowsLength: number) {
    setErrorMessage(null);
    setEditingRow({
      tableKey,
      rowKey: createRowKey(),
      displayOrder: rowsLength + 1,
      label: "",
      sasbinpuan: "",
      pencapaian: "",
      percent: "",
      isExisting: false,
    });
  }

  function startEdit(tableKey: string, row: OperationHourRow) {
    setErrorMessage(null);
    setEditingRow({
      tableKey,
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      label: row.label,
      sasbinpuan: String(row.sasbinpuan),
      pencapaian: String(row.pencapaian),
      percent: row.percent,
      isExisting: true,
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
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey: editingRow.tableKey,
        rowKey: editingRow.rowKey,
        displayOrder: editingRow.displayOrder,
        cells: {
          label: editingRow.label,
          sasbinpuan: editingRow.sasbinpuan,
          pencapaian: editingRow.pencapaian,
          percent: editingRow.percent,
        },
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Data chart gagal disimpan.");
      return;
    }

    setEditingRow(null);
    startTransition(() => router.refresh());
  }

  async function deleteRow(tableKey: string, row: OperationHourRow) {
    if (!window.confirm("Hapus data satuan ini dari chart?")) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/portal-table-rows", {
      method: "DELETE",
      credentials: "same-origin",
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
      setErrorMessage(body?.message ?? "Data chart gagal dihapus.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      {errorMessage ? (
        <p className="mb-5 rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6">
        {parsedGroups.map((group) => (
          <article
            key={group.tableKey}
            className="rounded-[6px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5"
          >
            <div className="rounded-[6px] border border-yellow-300/25 bg-[#071a38]/70 p-3">
              <h3 className="rounded-[4px] border border-yellow-300/60 bg-[#1b1f25]/95 px-4 py-2 text-center text-sm font-black uppercase leading-5 text-yellow-300 shadow-[0_10px_28px_rgba(0,0,0,0.25)] sm:text-base">
                {group.title}
              </h3>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => startAdd(group.tableKey, group.rows.length)}
                  disabled={isPending}
                  className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tambah Data
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto pb-1">
              <div className="min-w-[760px]">
                <div className="relative h-[360px] border-b border-l border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:100%_20%] px-4 pt-8">
                  <div className="absolute left-0 top-0 flex h-full -translate-x-3 flex-col justify-between py-1 text-[10px] font-bold text-slate-300">
                    {[10000, 8000, 6000, 4000, 2000, 0].map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>

                  <div
                    className="grid h-full items-end gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
                    }}
                  >
                    {group.rows.map((row) => (
                      <div
                        key={row.rowKey}
                        className="relative flex h-full items-end justify-center gap-1"
                      >
                        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap text-base font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                          {getPercent(row)}
                        </span>
                        <div className="flex h-full w-5 items-end">
                          <div
                            className="w-full rounded-t-sm bg-gradient-to-b from-[#6f95e6] to-[#2453ad] shadow-[0_0_14px_rgba(73,119,208,0.35)]"
                            style={{ height: barHeight(row.sasbinpuan) }}
                          />
                        </div>
                        <div className="flex h-full w-5 items-end">
                          <div
                            className="w-full rounded-t-sm bg-gradient-to-b from-[#ff9a55] to-[#ea640f] shadow-[0_0_14px_rgba(245,116,29,0.35)]"
                            style={{ height: barHeight(row.pencapaian) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-x border-b border-white/25 bg-[#101722]/95 text-[10px] font-black uppercase text-yellow-300">
                  <div
                    className="grid border-b border-white/25"
                    style={{
                      gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
                    }}
                  >
                    <div className="border-r border-white/25 p-2" />
                    {group.rows.map((row) => (
                      <div
                        key={row.rowKey}
                        className="flex min-h-11 items-center justify-center border-r border-white/25 px-1 text-center last:border-r-0"
                      >
                        {row.label}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid border-b border-white/25"
                    style={{
                      gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
                    }}
                  >
                    <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                      <span className="h-2 w-4 bg-[#3d6dca]" />
                      SASBINPUAN
                    </div>
                    {group.rows.map((row) => (
                      <div
                        key={`${row.rowKey}-sasbinpuan`}
                        className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                      >
                        {formatNumber(row.sasbinpuan)}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid border-b border-white/25"
                    style={{
                      gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
                    }}
                  >
                    <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                      <span className="h-2 w-4 bg-[#f47a25]" />
                      PENCAPAIAN
                    </div>
                    {group.rows.map((row) => (
                      <div
                        key={`${row.rowKey}-pencapaian`}
                        className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                      >
                        {formatNumber(row.pencapaian)}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid bg-[#071225]/80"
                    style={{
                      gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
                    }}
                  >
                    <div className="flex items-center border-r border-white/25 px-2 py-2 text-white">
                      AKSI
                    </div>
                    {group.rows.map((row) => (
                      <div
                        key={`${row.rowKey}-actions`}
                        className="flex items-center justify-center gap-1.5 border-r border-white/25 px-1 py-2 last:border-r-0"
                      >
                        <button
                          type="button"
                          onClick={() => startEdit(group.tableKey, row)}
                          className="rounded-[3px] border border-blue-200/50 bg-blue-700/90 px-2 py-1 text-[9px] font-black uppercase text-white transition hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteRow(group.tableKey, row)}
                          className="rounded-[3px] border border-red-300/50 bg-red-700/90 px-2 py-1 text-[9px] font-black uppercase text-white transition hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void saveRow(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                {editingRow.isExisting ? "Edit Data Chart" : "Tambah Data Chart"}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                    Label Satuan
                  </span>
                  <input
                    value={editingRow.label}
                    onChange={(event) =>
                      setEditingRow((current) =>
                        current
                          ? { ...current, label: event.target.value }
                          : current,
                      )
                    }
                    required
                    className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                    Sasbinpuan
                  </span>
                  <input
                    value={editingRow.sasbinpuan}
                    onChange={(event) =>
                      setEditingRow((current) =>
                        current
                          ? { ...current, sasbinpuan: event.target.value }
                          : current,
                      )
                    }
                    inputMode="numeric"
                    required
                    className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                    Pencapaian
                  </span>
                  <input
                    value={editingRow.pencapaian}
                    onChange={(event) =>
                      setEditingRow((current) =>
                        current
                          ? { ...current, pencapaian: event.target.value }
                          : current,
                      )
                    }
                    inputMode="numeric"
                    required
                    className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                    Persentase
                  </span>
                  <input
                    value={editingRow.percent}
                    onChange={(event) =>
                      setEditingRow((current) =>
                        current
                          ? { ...current, percent: event.target.value }
                          : current,
                      )
                    }
                    placeholder="Kosongkan agar dihitung otomatis"
                    className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                  />
                  <span className="mt-2 block text-xs leading-5 text-slate-300">
                    Jika dikosongkan, persen dihitung dari pencapaian dibagi sasbinpuan.
                  </span>
                </label>
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
