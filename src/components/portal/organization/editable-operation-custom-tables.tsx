"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useCanEditPortal } from "@/components/portal/portal-permissions-provider";

export function OperationCustomTableCreator() {
  const router = useRouter();
  const canEdit = useCanEditPortal();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function closeCreateForm() {
    setIsCreating(false);
    setTitle("");
    setErrorMessage(null);
  }

  async function createTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/operation-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Tabel Operasi gagal dibuat.");
        return;
      }

      closeCreateForm();
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Create custom operation table error:", error);
      setErrorMessage("Koneksi ke server gagal. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div className="mb-6 flex justify-end">
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsCreating(true);
        }}
        disabled={isPending || isSubmitting}
        className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-[#071225] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Tambah Tabel
      </button>

      {isCreating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={(event) => void createTable(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-white">
                Buat Tabel Operasi
              </h3>
              <button
                type="button"
                onClick={closeCreateForm}
                disabled={isPending || isSubmitting}
                className="rounded-[4px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
              >
                Batal
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
              {errorMessage ? (
                <p
                  role="alert"
                  className="rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100"
                >
                  {errorMessage}
                </p>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                  Judul Tabel
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  required
                  className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                  placeholder="Contoh: Kegiatan Operasi Semester II"
                />
              </label>
            </div>

            <div className="flex shrink-0 justify-end border-t border-white/10 bg-[#061225] px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={isPending || isSubmitting}
                className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-[#071225] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Buat Tabel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
