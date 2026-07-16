"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useCanEditPortal } from "@/components/portal/portal-permissions-provider";
import type { EditableTableRow } from "@/lib/portal-editable-tables";

type EditablePalposekCardsProps = {
  tableKey: string;
  rows: EditableTableRow[];
};

type EditingItem = {
  rowKey: string;
  displayOrder: number;
  title: string;
  content: string;
  isExisting: boolean;
};

type ParsedSection = {
  label: string;
  amount: string;
  items: string[];
};

function createRowKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `palposek-${Date.now()}`;
}

function cleanLine(line: string) {
  return line.replace(/^[-•]\s*/, "").trim();
}

function parseContent(value: string) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const sections: ParsedSection[] = [];
  const plainItems: string[] = [];
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^([^:]+):\s*(.+)$/);

    if (sectionMatch) {
      currentSection = {
        label: sectionMatch[1].trim(),
        amount: sectionMatch[2].trim(),
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    const item = cleanLine(line);

    if (!item) {
      continue;
    }

    if (currentSection) {
      currentSection.items.push(item);
    } else {
      plainItems.push(item);
    }
  }

  return {
    sections,
    plainItems,
  };
}

export function EditablePalposekCards({
  tableKey,
  rows,
}: EditablePalposekCardsProps) {
  const router = useRouter();
  const canEdit = useCanEditPortal();
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<EditingItem | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  function startAdd() {
    setErrorMessage(null);
    setEditingItem({
      rowKey: createRowKey(),
      displayOrder: rows.length + 1,
      title: "",
      content: "",
      isExisting: false,
    });
  }

  function startEdit(row: EditableTableRow) {
    setErrorMessage(null);
    setEditingItem({
      rowKey: row.rowKey,
      displayOrder: row.displayOrder,
      title: row.cells.title ?? "",
      content: row.cells.content ?? "",
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
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableKey,
        rowKey: editingItem.rowKey,
        displayOrder: editingItem.displayOrder,
        cells: {
          title: editingItem.title,
          content: editingItem.content,
        },
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setErrorMessage(body?.message ?? "Data Palposek gagal disimpan.");
      return;
    }

    setEditingItem(null);
    startTransition(() => router.refresh());
  }

  async function deleteItem(row: EditableTableRow) {
    if (!window.confirm("Hapus card kesiapan Palposek ini?")) {
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
      setErrorMessage(body?.message ?? "Data Palposek gagal dihapus.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      {canEdit ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200/90">
          Data dapat ditambah, diedit, atau dihapus langsung dari halaman ini.
        </p>
        <button
          type="button"
          onClick={startAdd}
          disabled={isPending}
          className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tambah Card
        </button>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="mb-5 rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {rows.map((row) => {
          const parsedContent = parseContent(row.cells.content ?? "");

          return (
            <article
              key={row.rowKey}
              className="group overflow-hidden rounded-[8px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_20px_55px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300/55 hover:shadow-[0_26px_70px_rgba(0,0,0,0.38)]"
            >
              <div className="flex items-start justify-between gap-3 border-b border-yellow-300/30 bg-[#071f4b] px-5 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                <h3 className="text-center text-2xl font-black uppercase tracking-[0.04em] text-yellow-100 sm:text-3xl">
                  {row.cells.title || "Kesiapan"}
                </h3>
                {canEdit ? (
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
                ) : null}
              </div>

              {parsedContent.sections.length ? (
                <div className="space-y-5 px-5 py-5 text-sm font-black uppercase leading-5 text-[#071a33] sm:text-base">
                  {parsedContent.sections.map((section) => (
                    <section
                      key={`${row.rowKey}-${section.label}`}
                    >
                      <div className="grid grid-cols-[3.5rem_1rem_1fr] items-baseline gap-2 text-[#0b2d66]">
                        <span>{section.label}</span>
                        <span>:</span>
                        <span>{section.amount}</span>
                      </div>

                      <ul className="mt-2 space-y-2 pl-5">
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={`${row.rowKey}-${section.label}-${itemIndex}`}
                            className="grid grid-cols-[1rem_1fr] gap-2"
                          >
                            <span>-</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3 px-5 py-5 text-sm font-black uppercase leading-5 text-[#071a33] sm:text-base">
                  {parsedContent.plainItems.map((item, itemIndex) => (
                    <li
                      key={`${row.rowKey}-${itemIndex}`}
                      className="flex gap-3"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b2d66] shadow-[0_0_0_3px_rgba(250,204,21,0.18)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
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
                  ? "Edit Kesiapan Palposek"
                  : "Tambah Kesiapan Palposek"}
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
                  Judul Card
                </span>
                <input
                  value={editingItem.title}
                  onChange={(event) =>
                    setEditingItem((current) =>
                      current
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                  required
                  className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                  Isi Card
                </span>
                <textarea
                  value={editingItem.content}
                  onChange={(event) =>
                    setEditingItem((current) =>
                      current
                        ? { ...current, content: event.target.value }
                        : current,
                    )
                  }
                  rows={12}
                  required
                  className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                />
                <span className="mt-2 block text-xs leading-5 text-slate-300">
                  Untuk bagian seperti Radio GTA, gunakan format
                  {" "}UHF: 2 unit lalu tulis item di baris berikutnya dengan tanda -.
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
