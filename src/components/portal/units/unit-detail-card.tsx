"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  type FormEvent,
  type KeyboardEvent,
  useState,
} from "react";

type EditableUnit = {
  id: string;
  code: string;
  slug: string;
  name: string;
  equipmentName: string | null;
  installationYear: number | null;
  psrCondition: string | null;
  psrRange: string | null;
  ssrCondition: string | null;
  ssrRange: string | null;
  description: string | null;
  imageUrl: string | null;
};

type UnitDetailCardProps = {
  unit: EditableUnit;
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

function fieldValue(value?: string | number | null) {
  return value?.toString() ?? "";
}

function InformationItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-950">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function UnitDetailCard({
  unit,
}: UnitDetailCardProps) {
  const router = useRouter();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  const portalTarget =
    typeof document !== "undefined" ? document.body : null;
  const editorTitleId = `unit-editor-title-${unit.id}`;

  function openEditor() {
    setFormStatus({
      type: "idle",
      message: "",
    });
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEditor();
    }
  }

  async function handleEditorSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setFormStatus({
      type: "idle",
      message: "",
    });

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("unitId", unit.id);

      const response = await fetch("/api/units/profile", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setFormStatus({
          type: "error",
          message:
            result?.message ?? "Data unit belum dapat disimpan.",
        });
        return;
      }

      setFormStatus({
        type: "success",
        message:
          result?.message ?? "Data unit berhasil disimpan.",
      });

      router.refresh();
    } catch (error) {
      console.error("Submit unit profile error:", error);

      setFormStatus({
        type: "error",
        message: "Koneksi ke server gagal. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={openEditor}
        onKeyDown={handleCardKeyDown}
        className="group mt-6 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:p-10">
          <div className="relative min-h-72 overflow-hidden rounded-2xl bg-slate-200">
            {unit.imageUrl ? (
              <Image
                src={unit.imageUrl}
                alt={`Perangkat ${unit.name}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center p-8 text-center text-slate-500">
                Foto perangkat belum ditambahkan
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
                  {unit.code}
                </p>

                <h1 className="mt-3 text-4xl font-bold">
                  {unit.name}
                </h1>
              </div>

              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Edit
              </span>
            </div>

            <p className="mt-3 text-xl font-semibold text-slate-600">
              {unit.equipmentName ?? "Perangkat belum diisi"}
            </p>

            {unit.description ? (
              <p className="mt-5 leading-7 text-slate-600">
                {unit.description}
              </p>
            ) : null}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InformationItem
                label="Tahun Instalasi"
                value={unit.installationYear}
              />

              <InformationItem
                label="Kondisi PSR"
                value={unit.psrCondition}
              />

              <InformationItem
                label="Jangkauan PSR"
                value={unit.psrRange}
              />

              <InformationItem
                label="Kondisi SSR"
                value={unit.ssrCondition}
              />

              <InformationItem
                label="Jangkauan SSR"
                value={unit.ssrRange}
              />
            </div>
          </div>
        </div>
      </article>

      {portalTarget && isEditorOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={editorTitleId}
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeEditor();
                }
              }}
            >
              <div className="max-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="h-1.5 bg-gradient-to-r from-blue-800 via-cyan-500 to-yellow-400" />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                        Edit Data Unit
                      </p>
                      <h2
                        id={editorTitleId}
                        className="mt-2 text-2xl font-black text-slate-950"
                      >
                        {unit.name}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closeEditor}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Tutup
                    </button>
                  </div>

                  <form
                    onSubmit={handleEditorSubmit}
                    className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]"
                  >
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
                        {unit.imageUrl ? (
                          <Image
                            src={unit.imageUrl}
                            alt={`Perangkat ${unit.name}`}
                            fill
                            sizes="300px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-8 text-center text-slate-500">
                            Foto perangkat belum ditambahkan
                          </div>
                        )}
                      </div>

                      <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                        Foto perangkat
                        <input
                          name="image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Kode unit
                          <input
                            name="code"
                            type="text"
                            required
                            defaultValue={unit.code}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Nama unit
                          <input
                            name="name"
                            type="text"
                            required
                            defaultValue={unit.name}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Nama perangkat
                          <input
                            name="equipmentName"
                            type="text"
                            defaultValue={fieldValue(
                              unit.equipmentName,
                            )}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Tahun instalasi
                          <input
                            name="installationYear"
                            type="number"
                            min="1900"
                            max="2100"
                            defaultValue={fieldValue(
                              unit.installationYear,
                            )}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Kondisi PSR
                          <input
                            name="psrCondition"
                            type="text"
                            defaultValue={fieldValue(unit.psrCondition)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Jangkauan PSR
                          <input
                            name="psrRange"
                            type="text"
                            defaultValue={fieldValue(unit.psrRange)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Kondisi SSR
                          <input
                            name="ssrCondition"
                            type="text"
                            defaultValue={fieldValue(unit.ssrCondition)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-700">
                          Jangkauan SSR
                          <input
                            name="ssrRange"
                            type="text"
                            defaultValue={fieldValue(unit.ssrRange)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Keterangan
                        <textarea
                          name="description"
                          rows={5}
                          defaultValue={fieldValue(unit.description)}
                          className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />
                      </label>

                      {formStatus.message ? (
                        <div
                          role="status"
                          className={
                            formStatus.type === "success"
                              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                              : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
                          }
                        >
                          {formStatus.message}
                        </div>
                      ) : null}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
