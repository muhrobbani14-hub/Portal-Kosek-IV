"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useCanEditPortal } from "@/components/portal/portal-permissions-provider";

type RadarStatusRow = {
  id: string | null;
  rowKey: string;
  cells: {
    component?: string;
    status?: string;
  };
  displayOrder: number;
};

type RadarUnit = {
  id: string;
  code: string;
  slug: string;
  name: string;
  equipmentName: string | null;
  description: string | null;
  imageUrl: string | null;
  radarStatusRows: RadarStatusRow[];
};

type RadarReadinessCardsProps = {
  units: RadarUnit[];
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

function fieldValue(value?: string | number | null) {
  return value?.toString() ?? "";
}

function isDataImageUrl(value?: string | null) {
  return Boolean(value?.startsWith("data:"));
}

function radarStatusTableKey(slug: string) {
  return `komlek-kesiapan-radar:${slug}`;
}

function createStatusRowKey() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStatusComponent(row: RadarStatusRow) {
  return row.cells.component?.trim() || "Komponen belum diisi";
}

function readStatusValue(row: RadarStatusRow) {
  return row.cells.status?.trim() || "-";
}

function getStatusPillClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("baik")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalizedStatus.includes("rusak") ||
    normalizedStatus.includes("gangguan") ||
    normalizedStatus.includes("tidak")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-700";
}

function splitStatusRows(rows: RadarStatusRow[]) {
  const middleIndex = Math.ceil(rows.length / 2);

  return [rows.slice(0, middleIndex), rows.slice(middleIndex)];
}
function normalizeStatusRows(rows: RadarStatusRow[]) {
  return rows
    .map((row, index) => ({
      ...row,
      rowKey: row.rowKey || createStatusRowKey(),
      displayOrder: index + 1,
      cells: {
        component: row.cells.component?.trim() ?? "",
        status: row.cells.status?.trim() ?? "",
      },
    }))
    .filter((row) => row.cells.component || row.cells.status);
}

function compressImageToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Format foto harus JPG, PNG, atau WebP."));
      return;
    }

    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxSize = 900;
      const scale = Math.min(
        1,
        maxSize / Math.max(image.width, image.height),
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Foto tidak dapat diproses."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Foto tidak dapat diproses."));
            return;
          }

          if (blob.size > 2 * 1024 * 1024) {
            reject(
              new Error(
                "Ukuran foto masih terlalu besar. Pilih foto yang lebih kecil.",
              ),
            );
            return;
          }

          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result !== "string") {
              reject(new Error("Foto tidak dapat diproses."));
              return;
            }

            resolve(reader.result);
          };

          reader.onerror = () => {
            reject(new Error("Foto tidak dapat diproses."));
          };

          reader.readAsDataURL(blob);
        },
        "image/webp",
        0.72,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Foto tidak dapat dibaca."));
    };

    image.src = objectUrl;
  });
}

export function RadarReadinessCards({
  units,
}: RadarReadinessCardsProps) {
  const router = useRouter();
  const canEdit = useCanEditPortal();
  const [editingUnit, setEditingUnit] = useState<RadarUnit | null>(
    null,
  );
  const [statusRows, setStatusRows] = useState<RadarStatusRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  function openEditor(unit: RadarUnit) {
    if (!canEdit) {
      return;
    }

    setFormStatus({
      type: "idle",
      message: "",
    });
    setStatusRows(unit.radarStatusRows);
    setRemoveImage(false);
    setEditingUnit(unit);
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setEditingUnit(null);
    setStatusRows([]);
    setFormStatus({
      type: "idle",
      message: "",
    });
    setRemoveImage(false);
  }

  function updateStatusRow(
    rowKey: string,
    cellKey: "component" | "status",
    value: string,
  ) {
    setStatusRows((currentRows) =>
      currentRows.map((row) =>
        row.rowKey === rowKey
          ? {
              ...row,
              cells: {
                ...row.cells,
                [cellKey]: value,
              },
            }
          : row,
      ),
    );
  }

  function addStatusRow() {
    setStatusRows((currentRows) => [
      ...currentRows,
      {
        id: null,
        rowKey: createStatusRowKey(),
        cells: {
          component: "",
          status: "Baik",
        },
        displayOrder: currentRows.length + 1,
      },
    ]);
  }

  function removeStatusRow(rowKey: string) {
    setStatusRows((currentRows) =>
      currentRows.filter((row) => row.rowKey !== rowKey),
    );
  }

  async function saveStatusRows(unit: RadarUnit) {
    const tableKey = radarStatusTableKey(unit.slug);
    const normalizedRows = normalizeStatusRows(statusRows);

    if (!normalizedRows.length) {
      throw new Error("Minimal satu status radar harus diisi.");
    }

    const nextRowKeys = new Set(
      normalizedRows.map((row) => row.rowKey),
    );
    const deletedRows = unit.radarStatusRows.filter(
      (row) => !nextRowKeys.has(row.rowKey),
    );

    const responses = await Promise.all([
      ...normalizedRows.map((row) =>
        fetch("/api/portal-table-rows", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableKey,
            rowKey: row.rowKey,
            cells: row.cells,
            displayOrder: row.displayOrder,
          }),
        }),
      ),
      ...deletedRows.map((row) =>
        fetch("/api/portal-table-rows", {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableKey,
            rowKey: row.rowKey,
            displayOrder: row.displayOrder,
          }),
        }),
      ),
    ]);

    const failedResponse = responses.find((response) => !response.ok);

    if (failedResponse) {
      const result = (await failedResponse.json().catch(() => null)) as
        | { message?: string }
        | null;

      throw new Error(
        result?.message ?? "Status kesiapan radar gagal disimpan.",
      );
    }
  }

  async function saveUnit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUnit) {
      return;
    }

    setIsSaving(true);
    setFormStatus({
      type: "idle",
      message: "",
    });

    try {
      const formData = new FormData(event.currentTarget);
      const selectedImage = formData.get("image");
      let imageDataUrl: string | null = null;

      if (selectedImage instanceof File && selectedImage.size > 0) {
        imageDataUrl = await compressImageToDataUrl(selectedImage);
      }

      const abortController = new AbortController();
      const abortTimeout = window.setTimeout(
        () => abortController.abort(),
        30_000,
      );
      let response: Response;

      try {
        response = await fetch(
          new URL(
            "/api/organization/radar-readiness",
            window.location.origin,
          ),
          {
            method: "POST",
            credentials: "same-origin",
            signal: abortController.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              unitId: editingUnit.id,
              code: formData.get("code"),
              name: formData.get("name"),
              equipmentName: formData.get("equipmentName"),
              description: formData.get("description"),
              imageDataUrl,
              removeImage: removeImage && !imageDataUrl,
            }),
          },
        );
      } finally {
        window.clearTimeout(abortTimeout);
      }

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setFormStatus({
          type: "error",
          message:
            result?.message ?? "Data kesiapan radar gagal disimpan.",
        });
        return;
      }

      await saveStatusRows(editingUnit);

      setFormStatus({
        type: "success",
        message:
          result?.message ?? "Data kesiapan radar berhasil disimpan.",
      });

      router.refresh();
    } catch (error) {
      console.error("Save radar readiness error:", error);

      setFormStatus({
        type: "error",
        message:
          error instanceof DOMException && error.name === "AbortError"
            ? "Server terlalu lama merespons. Coba gunakan foto yang lebih kecil."
            : error instanceof Error
              ? error.message
              : "Koneksi ke server gagal. Pastikan dev server masih berjalan lalu refresh halaman.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {units.map((unit) => (
          <article
            key={unit.id}
            className="group overflow-hidden rounded-[8px] border border-white/20 bg-white/95 text-[#061225] shadow-[0_18px_46px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-300/55 hover:bg-white hover:shadow-[0_26px_70px_rgba(0,0,0,0.38)]"
          >
            <div className="h-1 bg-gradient-to-r from-[#08265d] via-yellow-400 to-[#08265d] opacity-80 transition group-hover:opacity-100" />
            <div className="grid gap-4 p-4 sm:grid-cols-[112px_1fr] lg:p-5">
              <div className="relative h-28 overflow-hidden rounded-[6px] border border-slate-200 bg-[#e8eff8] shadow-inner">
                {unit.imageUrl ? (
                  <Image
                    src={unit.imageUrl}
                    alt={`Perangkat ${unit.name}`}
                    fill
                    sizes="112px"
                    unoptimized={isDataImageUrl(unit.imageUrl)}
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-[11px] font-bold text-slate-500">
                    Foto belum ada
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
                      {unit.code}
                    </p>
                    <h3 className="mt-2 text-2xl font-black uppercase text-[#020817] sm:text-3xl">
                      {unit.name}
                    </h3>
                    <p className="mt-2 text-base font-black text-slate-600 sm:text-lg">
                      {unit.equipmentName ?? "Perangkat belum diisi"}
                    </p>
                  </div>

                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => openEditor(unit)}
                      className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 group-hover:border-yellow-300/70 group-hover:bg-[#071f4b] group-hover:text-yellow-100"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>

                {unit.description ? (
                  <p className="mt-4 max-h-14 overflow-hidden text-sm font-medium leading-7 text-slate-600">
                    {unit.description}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {splitStatusRows(unit.radarStatusRows).map(
                    (columnRows, columnIndex) => {
                      const rowOffset = columnIndex === 0
                        ? 0
                        : splitStatusRows(unit.radarStatusRows)[0].length;

                      return (
                        <div key={columnIndex} className="grid gap-2">
                          {columnRows.map((row, rowIndex) => {
                            const status = readStatusValue(row);

                            return (
                              <div
                                key={row.rowKey}
                                className="flex min-h-11 items-center gap-3 rounded-[6px] border border-[#d9e3ef] bg-[#f8fbff] px-3 py-2 shadow-[0_10px_22px_rgba(7,18,37,0.05)]"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#08265d] text-[11px] font-black text-yellow-100">
                                  {rowOffset + rowIndex + 1}
                                </span>
                                <span className="min-w-0 flex-1 text-xs font-black uppercase tracking-[0.05em] text-[#061225]">
                                  {readStatusComponent(row)}
                                </span>
                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${getStatusPillClass(status)}`}
                                >
                                  {status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingUnit ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="radar-readiness-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditor();
            }
          }}
        >
          <form
            onSubmit={(event) => void saveUnit(event)}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
                  Edit Kesiapan Radar
                </p>
                <h3
                  id="radar-readiness-editor-title"
                  className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white"
                >
                  {editingUnit.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                className="rounded-[4px] border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              {formStatus.message ? (
                <p
                  className={
                    formStatus.type === "success"
                      ? "mb-4 rounded-[4px] border border-emerald-400/40 bg-emerald-950/70 px-4 py-3 text-sm font-semibold text-emerald-100"
                      : "mb-4 rounded-[4px] border border-red-400/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100"
                  }
                >
                  {formStatus.message}
                </p>
              ) : null}

              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      Kode Unit
                    </span>
                    <input
                      name="code"
                      type="text"
                      required
                      defaultValue={editingUnit.code}
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      Nama Unit
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      defaultValue={editingUnit.name}
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      Nama Perangkat
                    </span>
                    <input
                      name="equipmentName"
                      type="text"
                      defaultValue={fieldValue(editingUnit.equipmentName)}
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                    />
                  </label>
                </div>

                <div className="rounded-[6px] border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100">
                        Status Perangkat
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-300">
                        Edit daftar komponen dan status kesiapan radar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStatusRow}
                      disabled={isSaving}
                      className="rounded-[4px] border border-yellow-300/40 bg-yellow-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-yellow-100 transition hover:bg-yellow-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Tambah Item
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {statusRows.map((row, index) => (
                      <div
                        key={row.rowKey}
                        className="grid gap-3 rounded-[6px] border border-white/10 bg-[#071b3d] p-3 sm:grid-cols-[44px_1fr_180px_auto] sm:items-end"
                      >
                        <div className="flex h-10 items-center justify-center rounded-[4px] border border-white/10 bg-white/5 text-sm font-black text-yellow-100">
                          {index + 1}
                        </div>

                        <label className="block">
                          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-300">
                            Komponen
                          </span>
                          <input
                            type="text"
                            value={row.cells.component ?? ""}
                            onChange={(event) =>
                              updateStatusRow(
                                row.rowKey,
                                "component",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-300">
                            Status
                          </span>
                          <input
                            type="text"
                            value={row.cells.status ?? ""}
                            onChange={(event) =>
                              updateStatusRow(
                                row.rowKey,
                                "status",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => removeStatusRow(row.rowKey)}
                          disabled={isSaving || statusRows.length <= 1}
                          className="rounded-[4px] border border-red-300/30 bg-red-950/40 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-red-100 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      Foto Perangkat
                    </span>
                    <input
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-xs font-medium text-slate-950 file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#071f4b] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:text-white"
                    />
                    <span className="mt-2 block text-xs text-slate-300">
                      Foto akan otomatis diperkecil sebelum disimpan.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                      Keterangan
                    </span>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={fieldValue(editingUnit.description)}
                      className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                    />
                  </label>
                </div>

                {editingUnit.imageUrl ? (
                  <label className="flex items-start gap-3 rounded-[4px] border border-red-300/30 bg-red-950/30 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(event) =>
                        setRemoveImage(event.target.checked)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-white/30 text-red-500 accent-red-500"
                    />
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.08em] text-red-100">
                        Hapus foto saat disimpan
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-red-100/80">
                        Jika memilih foto baru, opsi hapus akan diabaikan dan foto baru yang dipakai.
                      </span>
                    </span>
                  </label>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 justify-end border-t border-white/10 bg-[#061225] px-5 py-4 sm:px-7">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-[4px] border border-yellow-300/50 bg-yellow-300 px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-[#071225] transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}