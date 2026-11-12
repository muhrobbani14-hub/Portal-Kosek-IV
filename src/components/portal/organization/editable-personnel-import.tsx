"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useCanEditPortal } from "@/components/portal/portal-permissions-provider";

type EditablePersonnelImportProps = {
  category: string;
};

type ImportResult = {
  message?: string;
  importedCount?: number;
  skippedDuplicateCount?: number;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function EditablePersonnelImport({
  category,
}: EditablePersonnelImportProps) {
  const router = useRouter();
  const canEdit = useCanEditPortal();
  const [isPending, startTransition] = useTransition();
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function importFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setResultMessage(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    if (!file) {
      setErrorMessage("Pilih file Excel terlebih dahulu.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setErrorMessage("Format file harus .xlsx.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Ukuran file maksimal 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("category", category);
    setIsImporting(true);

    try {
      const response = await fetch("/api/personnel/import", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as
        | ImportResult
        | null;

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Data personel gagal diimpor.");
        return;
      }

      setResultMessage(result?.message ?? "Impor data personel berhasil.");
      form.reset();
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Import personnel spreadsheet request error:", error);
      setErrorMessage("Koneksi ke server gagal. Silakan coba lagi.");
    } finally {
      setIsImporting(false);
    }
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => void importFile(event)}
        className="flex flex-wrap items-end justify-end gap-3"
      >
        <label className="min-w-60 flex-1 text-left sm:flex-none">
          <span className="mb-1 block text-xs font-bold text-slate-300">
            Impor dari Excel (.xlsx)
          </span>
          <input
            name="file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            disabled={isImporting || isPending}
            className="block w-full rounded-[4px] border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200 file:mr-3 file:rounded-[3px] file:border-0 file:bg-white/15 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white disabled:opacity-60 sm:w-80"
          />
        </label>
        <div className="flex gap-2">
          <a
            href={`/api/personnel/import?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center rounded-[4px] border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
          >
            Unduh Template
          </a>
          <button
            type="submit"
            disabled={isImporting || isPending}
            className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#071225] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting ? "Mengimpor..." : "Impor Data"}
          </button>
        </div>
      </form>

      <p className="text-right text-xs text-slate-400">
        Impor menambahkan data baru. NRP/NIP duplikat akan dilewati; maksimal
        1.000 baris dan ukuran file 5 MB. Atur kolom NRP/NIP sebagai Teks agar
        angka 0 di depan tidak hilang.
      </p>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-[4px] border border-red-300/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100"
        >
          {errorMessage}
        </p>
      ) : null}

      {resultMessage ? (
        <p
          role="status"
          className="rounded-[4px] border border-emerald-300/30 bg-emerald-950/60 px-4 py-3 text-sm font-semibold text-emerald-100"
        >
          {resultMessage}
        </p>
      ) : null}
    </div>
  );
}
