"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

type ProblemStatusValue =
  | "REPORTED"
  | "IN_PROGRESS"
  | "WAITING_SUPPORT"
  | "WAITING_PART"
  | "COMPLETED"
  | "CLOSED";

type MaintenanceAction = {
  id: string;
  actionDate: string;
  description: string;
  letterNumber: string | null;
  result: string | null;
  attachmentUrl: string | null;
};

type MaintenanceProblem = {
  id: string;
  title: string;
  description: string;
  occurredAt: string | null;
  imageUrl: string | null;
  status: ProblemStatusValue;
  actions: MaintenanceAction[];
};

type UnitMaintenanceSectionProps = {
  unitId: string;
  problems: MaintenanceProblem[];
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

type ActiveAction = {
  problemId: string;
  action: MaintenanceAction | null;
};

const problemStatusLabels: Record<ProblemStatusValue, string> = {
  REPORTED: "Dilaporkan",
  IN_PROGRESS: "Dalam Penanganan",
  WAITING_SUPPORT: "Menunggu Dukungan",
  WAITING_PART: "Menunggu Suku Cadang",
  COMPLETED: "Selesai",
  CLOSED: "Ditutup",
};

const problemStatusOptions = Object.entries(problemStatusLabels);

function fieldValue(value?: string | number | null) {
  return value?.toString() ?? "";
}

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function isDisplayableImageUrl(value?: string | null) {
  return Boolean(value?.startsWith("/"));
}

export default function UnitMaintenanceSection({
  unitId,
  problems,
}: UnitMaintenanceSectionProps) {
  const router = useRouter();
  const [activeProblem, setActiveProblem] =
    useState<MaintenanceProblem | null>(null);
  const [isProblemEditorOpen, setIsProblemEditorOpen] =
    useState(false);
  const [activeAction, setActiveAction] =
    useState<ActiveAction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  const portalTarget =
    typeof document !== "undefined" ? document.body : null;

  const problemEditorTitle = activeProblem
    ? "Edit Permasalahan"
    : "Tambah Permasalahan";
  const actionEditorTitle = activeAction?.action
    ? "Edit Upaya Penanganan"
    : "Tambah Upaya Penanganan";

  const problemById = useMemo(
    () => new Map(problems.map((problem) => [problem.id, problem])),
    [problems],
  );

  function openProblemEditor(problem: MaintenanceProblem | null) {
    setActiveProblem(problem);
    setFormStatus({
      type: "idle",
      message: "",
    });
    setIsProblemEditorOpen(true);
  }

  function closeProblemEditor() {
    setIsProblemEditorOpen(false);
    setActiveProblem(null);
  }

  function openActionEditor(
    problemId: string,
    action: MaintenanceAction | null,
  ) {
    setActiveAction({
      problemId,
      action,
    });
    setFormStatus({
      type: "idle",
      message: "",
    });
    setIsProblemEditorOpen(false);
  }

  function closeActionEditor() {
    setActiveAction(null);
  }

  async function submitForm(
    event: FormEvent<HTMLFormElement>,
    endpoint: string,
    successFallback: string,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setFormStatus({
      type: "idle",
      message: "",
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setFormStatus({
          type: "error",
          message:
            result?.message ?? "Data belum dapat disimpan.",
        });
        return;
      }

      setFormStatus({
        type: "success",
        message: result?.message ?? successFallback,
      });

      router.refresh();
    } catch (error) {
      console.error("Submit maintenance form error:", error);

      setFormStatus({
        type: "error",
        message: "Koneksi ke server gagal. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleProblemSubmit(event: FormEvent<HTMLFormElement>) {
    submitForm(
      event,
      "/api/units/problems",
      "Permasalahan berhasil disimpan.",
    );
  }

  function handleActionSubmit(event: FormEvent<HTMLFormElement>) {
    submitForm(
      event,
      "/api/units/problem-actions",
      "Upaya penanganan berhasil disimpan.",
    );
  }

  return (
    <>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-700">
              Pemeliharaan
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Permasalahan dan Upaya Penanganan
            </h2>
          </div>

          <button
            type="button"
            onClick={() => openProblemEditor(null)}
            className="w-fit rounded-xl bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-800"
          >
            Tambah Permasalahan
          </button>
        </div>

        {problems.length === 0 ? (
          <button
            type="button"
            onClick={() => openProblemEditor(null)}
            className="mt-8 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center font-semibold text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            Belum ada data permasalahan untuk unit ini.
          </button>
        ) : (
          <div className="mt-8 space-y-6">
            {problems.map((problem, index) => (
              <article
                key={problem.id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() => openProblemEditor(problem)}
                  className="w-full border-b border-red-100 bg-red-50/80 p-5 text-left transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Permasalahan {index + 1}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-950">
                        {problem.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Tanggal kejadian:{" "}
                        {formatDate(problem.occurredAt)}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-800 ring-1 ring-red-100">
                      {problemStatusLabels[problem.status]}
                    </span>
                  </div>
                </button>

                <div className="grid gap-6 p-5 lg:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openProblemEditor(problem)}
                    className="rounded-2xl border border-red-100 bg-red-50/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                  >
                    <h4 className="font-bold text-red-900">
                      Deskripsi Permasalahan
                    </h4>

                    <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                      {problem.description}
                    </p>

                    {problem.imageUrl ? (
                      <div className="relative mt-5 h-64 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={problem.imageUrl}
                          alt={problem.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </button>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-bold text-blue-950">
                        Riwayat Upaya Penanganan
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          openActionEditor(problem.id, null)
                        }
                        className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-800"
                      >
                        Tambah
                      </button>
                    </div>

                    {problem.actions.length === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          openActionEditor(problem.id, null)
                        }
                        className="mt-4 w-full rounded-xl border border-dashed border-blue-200 bg-white/70 p-5 text-left font-semibold text-slate-500 transition hover:border-blue-300 hover:text-blue-700"
                      >
                        Belum ada upaya penanganan yang dicatat.
                      </button>
                    ) : (
                      <ol className="mt-5 space-y-4">
                        {problem.actions.map(
                          (action, actionIndex) => (
                            <li key={action.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  openActionEditor(
                                    problem.id,
                                    action,
                                  )
                                }
                                className="relative w-full rounded-xl border border-blue-200 bg-white p-4 pl-10 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                              >
                                <span className="absolute left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                                  {actionIndex + 1}
                                </span>

                                <p className="font-semibold text-slate-950">
                                  {formatDate(action.actionDate)}
                                </p>

                                {action.letterNumber ? (
                                  <p className="mt-1 text-sm text-slate-500">
                                    Nomor surat:{" "}
                                    {action.letterNumber}
                                  </p>
                                ) : null}

                                <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
                                  {action.description}
                                </p>

                                {action.result ? (
                                  <p className="mt-2 text-sm font-medium text-emerald-700">
                                    Hasil: {action.result}
                                  </p>
                                ) : null}

                                {isDisplayableImageUrl(
                                  action.attachmentUrl,
                                ) ? (
                                  <div className="relative mt-4 h-44 overflow-hidden rounded-xl bg-slate-100">
                                    <Image
                                      src={action.attachmentUrl ?? ""}
                                      alt={`Lampiran upaya ${actionIndex + 1}`}
                                      fill
                                      sizes="(max-width: 1024px) 100vw, 50vw"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : null}
                              </button>
                            </li>
                          ),
                        )}
                      </ol>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {portalTarget && isProblemEditorOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="problem-editor-title"
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeProblemEditor();
                }
              }}
            >
              <div className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="h-1.5 bg-gradient-to-r from-red-800 via-orange-400 to-yellow-400" />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-700">
                        Permasalahan
                      </p>
                      <h2
                        id="problem-editor-title"
                        className="mt-2 text-2xl font-black text-slate-950"
                      >
                        {problemEditorTitle}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closeProblemEditor}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Tutup
                    </button>
                  </div>

                  <form
                    onSubmit={handleProblemSubmit}
                    className="mt-6 grid gap-5"
                  >
                    <input
                      type="hidden"
                      name="unitId"
                      value={unitId}
                    />
                    <input
                      type="hidden"
                      name="problemId"
                      value={fieldValue(activeProblem?.id)}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Judul permasalahan
                        <input
                          name="title"
                          type="text"
                          required
                          defaultValue={fieldValue(
                            activeProblem?.title,
                          )}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Tanggal kejadian
                        <input
                          name="occurredAt"
                          type="date"
                          defaultValue={fieldValue(
                            activeProblem?.occurredAt,
                          )}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Status
                        <select
                          name="status"
                          defaultValue={
                            activeProblem?.status ?? "REPORTED"
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                        >
                          {problemStatusOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Foto permasalahan
                        <input
                          name="image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-lg file:border-0 file:bg-red-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                        />
                      </label>
                    </div>

                    {activeProblem?.imageUrl ? (
                      <div className="relative h-56 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={activeProblem.imageUrl}
                          alt={activeProblem.title}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Deskripsi permasalahan
                      <textarea
                        name="description"
                        rows={6}
                        required
                        defaultValue={fieldValue(
                          activeProblem?.description,
                        )}
                        className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
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
                        className="rounded-xl bg-red-700 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving
                          ? "Menyimpan..."
                          : "Simpan Permasalahan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}

      {portalTarget && activeAction
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="action-editor-title"
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeActionEditor();
                }
              }}
            >
              <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="h-1.5 bg-gradient-to-r from-blue-800 via-cyan-500 to-emerald-400" />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                        Upaya Penanganan
                      </p>
                      <h2
                        id="action-editor-title"
                        className="mt-2 text-2xl font-black text-slate-950"
                      >
                        {actionEditorTitle}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {problemById.get(activeAction.problemId)?.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeActionEditor}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                      Tutup
                    </button>
                  </div>

                  <form
                    onSubmit={handleActionSubmit}
                    className="mt-6 grid gap-5"
                  >
                    <input
                      type="hidden"
                      name="problemId"
                      value={activeAction.problemId}
                    />
                    <input
                      type="hidden"
                      name="actionId"
                      value={fieldValue(activeAction.action?.id)}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Tanggal upaya
                        <input
                          name="actionDate"
                          type="date"
                          required
                          defaultValue={
                            activeAction.action?.actionDate ??
                            todayInputValue()
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-slate-700">
                        Nomor surat
                        <input
                          name="letterNumber"
                          type="text"
                          defaultValue={fieldValue(
                            activeAction.action?.letterNumber,
                          )}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Deskripsi upaya
                      <textarea
                        name="description"
                        rows={5}
                        required
                        defaultValue={fieldValue(
                          activeAction.action?.description,
                        )}
                        className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Hasil
                      <textarea
                        name="result"
                        rows={3}
                        defaultValue={fieldValue(
                          activeAction.action?.result,
                        )}
                        className="resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Foto/lampiran upaya
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                      />
                    </label>

                    {isDisplayableImageUrl(
                      activeAction.action?.attachmentUrl,
                    ) ? (
                      <div className="relative h-56 overflow-hidden rounded-xl bg-slate-100">
                        <Image
                          src={activeAction.action?.attachmentUrl ?? ""}
                          alt="Lampiran upaya penanganan"
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

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
                        {isSaving
                          ? "Menyimpan..."
                          : "Simpan Upaya"}
                      </button>
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
