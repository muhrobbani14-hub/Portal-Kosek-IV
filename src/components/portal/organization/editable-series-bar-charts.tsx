"use client";

import {
  type CSSProperties,
  type FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import type { EditableTableRow } from "@/lib/portal-editable-tables";

type ChartSeries = {
  key: string;
  label: string;
  className: string;
};

type EditableSeriesChartGroup = {
  title: string;
  tableKey: string;
  rows: EditableTableRow[];
  series: ChartSeries[];
  maxValue?: number;
  yAxisValues?: number[];
  minWidth?: string;
  variant?: "white" | "dark";
};

type EditableSeriesBarChartsProps = {
  groups: EditableSeriesChartGroup[];
};

type ParsedChartRow = {
  rowKey: string;
  displayOrder: number;
  label: string;
  values: Record<string, number>;
};

type EditingRow = {
  tableKey: string;
  rowKey: string;
  displayOrder: number;
  label: string;
  values: Record<string, string>;
  isExisting: boolean;
  series: ChartSeries[];
};

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `chart-row-${Date.now()}`;
}

function parseNumber(value: string | undefined) {
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

function barHeight(value: number, maxValue: number) {
  return `${Math.max((value / maxValue) * 100, value > 0 ? 3 : 0)}%`;
}

function parseRows(rows: EditableTableRow[], series: ChartSeries[]) {
  return rows.map((row) => ({
    rowKey: row.rowKey,
    displayOrder: row.displayOrder,
    label: row.cells.label ?? "",
    values: Object.fromEntries(
      series.map((item) => [item.key, parseNumber(row.cells[item.key])]),
    ),
  }));
}

function getMaxValue(
  rows: ParsedChartRow[],
  series: ChartSeries[],
  explicitMaxValue?: number,
) {
  if (explicitMaxValue) {
    return explicitMaxValue;
  }

  return Math.max(
    1,
    ...rows.flatMap((row) => series.map((item) => row.values[item.key] ?? 0)),
  );
}

export function EditableSeriesBarCharts({
  groups,
}: EditableSeriesBarChartsProps) {
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
        rows: parseRows(group.rows, group.series),
      })),
    [groups],
  );

  function startAdd(
    tableKey: string,
    series: ChartSeries[],
    rowsLength: number,
  ) {
    setErrorMessage(null);
    setEditingRow({
      tableKey,
      rowKey: createRowKey(),
      displayOrder: rowsLength + 1,
      label: "",
      values: Object.fromEntries(series.map((item) => [item.key, ""])),
      isExisting: false,
      series,
    });
  }

  function startEdit(
    tableKey: string,
    series: ChartSeries[],
    row: ParsedChartRow,
  ) {
    setErrorMessage(null);
    setEditingRow({
      tableKey,
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      label: row.label,
      values: Object.fromEntries(
        series.map((item) => [
          item.key,
          String(row.values[item.key] ?? 0),
        ]),
      ),
      isExisting: true,
      series,
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
          ...editingRow.values,
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

  async function deleteRow(tableKey: string, row: ParsedChartRow) {
    if (!window.confirm("Hapus data ini dari chart?")) {
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
        {parsedGroups.map((group) => {
          const maxValue = getMaxValue(
            group.rows,
            group.series,
            group.maxValue,
          );
          const yAxisValues =
            group.yAxisValues ??
            [maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map(
              Math.round,
            );
          const isDark = group.variant === "dark";

          return (
            <article
              key={group.tableKey}
              className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md sm:p-5"
            >
              <div className="rounded-[6px] border border-yellow-300/25 bg-[#071a38]/70 p-3">
                <h3 className="rounded-[4px] border border-yellow-300/60 bg-[#072966] px-4 py-3 text-center text-base font-black uppercase leading-6 text-yellow-300 shadow-[0_10px_28px_rgba(0,0,0,0.25)] sm:text-lg">
                  {group.title}
                </h3>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      startAdd(group.tableKey, group.series, group.rows.length)
                    }
                    disabled={isPending}
                    className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Tambah Data
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto pb-1">
                <div className={group.minWidth ?? "min-w-[980px]"}>
                  <div
                    className={[
                      "relative h-[470px] border-b border-l border-white/25 px-7 pt-10",
                      isDark
                        ? "overflow-hidden bg-[#0b2235]/85"
                        : "bg-white/95",
                    ].join(" ")}
                  >
                    {isDark ? (
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at center, rgba(255,255,255,0.3) 1px, transparent 1px)",
                          backgroundSize: "18px 18px",
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_1px,transparent_1px)] bg-[length:100%_20%]" />
                    <div className="absolute left-0 top-0 flex h-full -translate-x-3 flex-col justify-between py-8 text-[10px] font-bold text-slate-500">
                      {yAxisValues.map((value) => (
                        <span key={value}>{formatNumber(value)}</span>
                      ))}
                    </div>

                    <div
                      className="relative z-10 grid h-full items-end gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${group.rows.length}, minmax(${isDark ? "5rem" : "2.5rem"}, 1fr))`,
                      }}
                    >
                      {group.rows.map((row) => (
                        <div
                          key={row.rowKey}
                          className="flex h-full flex-col items-center justify-end"
                        >
                          <div
                            className={[
                              "flex items-end",
                              isDark ? "h-full gap-2" : "h-[78%] gap-1",
                            ].join(" ")}
                          >
                            {group.series.map((series) => {
                              const value = row.values[series.key] ?? 0;
                              const currentBarHeight = barHeight(
                                value,
                                maxValue,
                              );

                              return (
                                <div
                                  key={`${row.rowKey}-${series.key}`}
                                  className={[
                                    "relative flex h-full items-end",
                                    isDark ? "w-4" : "w-3",
                                  ].join(" ")}
                                  title={`${series.label}: ${formatNumber(value)}`}
                                >
                                  {value > 0 || !isDark ? (
                                    <span
                                      className={[
                                        "absolute bottom-[calc(var(--bar-height)+0.35rem)] left-1/2 -translate-x-1/2 font-black",
                                        isDark
                                          ? "text-[10px] text-yellow-300"
                                          : "text-[10px] text-slate-700",
                                      ].join(" ")}
                                    >
                                      {formatNumber(value)}
                                    </span>
                                  ) : null}
                                  <div
                                    className={[
                                      "w-full rounded-t-sm",
                                      isDark
                                        ? "shadow-[6px_-4px_0_rgba(255,255,255,0.12),10px_-7px_12px_rgba(0,0,0,0.32)]"
                                        : "",
                                      series.className,
                                    ].join(" ")}
                                    style={
                                      {
                                        height: currentBarHeight,
                                        "--bar-height": currentBarHeight,
                                      } as CSSProperties
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <span
                            className={[
                              "mt-4 whitespace-nowrap text-xs font-bold",
                              isDark
                                ? "text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                                : "text-slate-600",
                            ].join(" ")}
                          >
                            {row.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {isDark ? (
                      <div className="absolute right-4 top-16 z-20 space-y-2 text-right text-[11px] font-black uppercase text-yellow-300">
                        {[...group.series].reverse().map((series) => (
                          <div
                            key={series.key}
                            className="flex items-center justify-end gap-2"
                          >
                            <span>{series.label}</span>
                            <span className={`h-2.5 w-4 ${series.className}`} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={[
                      "flex justify-center gap-6 py-4 text-sm font-black uppercase",
                      isDark
                        ? "border-x border-b border-white/25 bg-[#101722]/95 text-yellow-300"
                        : "bg-white/95 text-slate-600",
                    ].join(" ")}
                  >
                    {group.series.map((series) => (
                      <div
                        key={series.key}
                        className="flex items-center gap-2"
                      >
                        <span className={`h-3 w-4 ${series.className}`} />
                        {series.label}
                      </div>
                    ))}
                  </div>

                  {isDark ? (
                    <div className="border-x border-b border-white/25 bg-[#101722]/95 text-[10px] font-black uppercase text-yellow-300">
                      <div
                        className="grid border-b border-white/25"
                        style={{
                          gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(5rem, 1fr))`,
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

                      {group.series.map((series) => (
                        <div
                          key={series.key}
                          className="grid border-b border-white/25 last:border-b-0"
                          style={{
                            gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(5rem, 1fr))`,
                          }}
                        >
                          <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                            <span className={`h-2 w-4 ${series.className}`} />
                            {series.label}
                          </div>
                          {group.rows.map((row) => (
                            <div
                              key={`${row.rowKey}-${series.key}`}
                              className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                            >
                              {formatNumber(row.values[series.key] ?? 0)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div
                    className={[
                      "border-x border-b px-3 py-3",
                      isDark
                        ? "border-white/25 bg-[#071225]/95"
                        : "border-slate-200 bg-white/95",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap justify-center gap-2">
                      {group.rows.map((row) => (
                        <div
                          key={`${row.rowKey}-actions`}
                          className={[
                            "flex items-center gap-2 rounded-[4px] border px-2.5 py-1.5 shadow-sm",
                            isDark
                              ? "border-yellow-300/20 bg-white/5 text-yellow-300"
                              : "border-slate-200 bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          <span className="max-w-32 truncate text-[10px] font-black uppercase">
                            {row.label}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(group.tableKey, group.series, row)
                            }
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
          );
        })}
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
                    Label
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

                {editingRow.series.map((series) => (
                  <label key={series.key} className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      {series.label}
                    </span>
                    <input
                      value={editingRow.values[series.key] ?? ""}
                      onChange={(event) =>
                        setEditingRow((current) =>
                          current
                            ? {
                                ...current,
                                values: {
                                  ...current.values,
                                  [series.key]: event.target.value,
                                },
                              }
                            : current,
                        )
                      }
                      inputMode="numeric"
                      required
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
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
