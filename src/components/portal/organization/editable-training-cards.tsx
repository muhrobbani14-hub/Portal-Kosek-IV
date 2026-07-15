"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { EditableTableRow } from "@/lib/portal-editable-tables";

type EditingTrainingItem = {
  rowKey: string;
  displayOrder: number;
  title: string;
  details: string;
  isExisting: boolean;
};

type EditableTrainingCardsProps = {
  tableKey: string;
  rows: EditableTableRow[];
  wideRowKeys?: string[];
};

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `training-${Date.now()}`;
}

function detailLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function EditableTrainingCards({
  tableKey,
  rows,
  wideRowKeys = [],
}: EditableTrainingCardsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] =
    useState<EditingTrainingItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startAdd() {
    setErrorMessage(null);
    setEditingItem({
      rowKey: createRowKey(),
      displayOrder: rows.length + 1,
      title: "",
      details: "",
      isExisting: false,
    });
  }

  function startEdit(row: EditableTableRow) {
    setErrorMessage(null);
    setEditingItem({
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      title: row.cells.title ?? "",
      details: row.cells.details ?? "",
      isExisting: true,
    });
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    setErrorMessage(null);

    const response = await fetch("/api/portal-table-rows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey,
        rowKey: editingItem.rowKey,
        displayOrder: editingItem.displayOrder,
        cells: {
          title: editingItem.title,
          details: editingItem.details,
        },
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Data latihan gagal disimpan.");
      return;
    }

    setEditingItem(null);
    startTransition(() => router.refresh());
  }

  async function deleteItem(row: EditableTableRow) {
    if (!window.confirm("Hapus kegiatan latihan ini?")) {
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
      setErrorMessage(body?.message ?? "Kegiatan latihan gagal dihapus.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200/90">
          Kegiatan dapat ditambah, diedit, atau dihapus langsung dari halaman ini.
        </p>
        <button
          type="button"
          onClick={startAdd}
          disabled={isPending}
          className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tambah Kegiatan
        </button>
      </div>

      {errorMessage ? (
        <p className="mb-5 rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {rows.map((row) => (
          <article
            key={row.rowKey}
            className={[
              "overflow-hidden rounded-[6px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_18px_48px_rgba(0,0,0,0.36)]",
              wideRowKeys.includes(row.rowKey) ? "lg:col-span-2" : "",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3 border-b border-yellow-300/30 bg-[#071f4b] px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
              <h3 className="text-sm font-black uppercase tracking-[0.06em] text-yellow-100">
                {row.cells.title || "Kegiatan Latihan"}
              </h3>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  disabled={isPending}
                  className="rounded-[3px] border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deleteItem(row)}
                  disabled={isPending}
                  className="rounded-[3px] border border-red-300/45 bg-red-700/90 px-2 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hapus
                </button>
              </div>
            </div>
            <ul className="space-y-1 px-5 py-4 text-sm font-bold leading-5 text-[#071a33]">
              {detailLines(row.cells.details ?? "").map((detail, index) => (
                <li key={`${row.rowKey}-${index}`}>
                  <span className="mr-1 text-[#0b2d66]">-</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void saveItem(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                {editingItem.isExisting
                  ? "Edit Kegiatan Latihan"
                  : "Tambah Kegiatan Latihan"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
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

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                  Judul Kegiatan
                </span>
                <textarea
                  value={editingItem.title}
                  onChange={(event) =>
                    setEditingItem((current) =>
                      current
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                  rows={2}
                  required
                  className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium leading-5 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                  Rincian Kegiatan
                </span>
                <textarea
                  value={editingItem.details}
                  onChange={(event) =>
                    setEditingItem((current) =>
                      current
                        ? { ...current, details: event.target.value }
                        : current,
                    )
                  }
                  rows={12}
                  required
                  className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                />
                <span className="mt-2 block text-xs text-slate-300">
                  Gunakan baris baru untuk membuat setiap poin rincian.
                </span>
              </label>
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
