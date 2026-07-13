"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OrganizationPosition } from "@/lib/organization-structure";

type PositionCardProps = {
  position: OrganizationPosition;
  emphasis?: boolean;
  compact?: boolean;
};

type PopupPosition = {
  top: number;
  left: number;
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

function getDisplayValue(value?: string | null) {
  return value?.trim() || "Belum diisi";
}

function fieldValue(value?: string | null) {
  return value ?? "";
}

function getInitials(position: OrganizationPosition) {
  const source = position.name?.trim() || position.title;

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function isDataImageUrl(value?: string | null) {
  return Boolean(value?.startsWith("data:"));
}

export default function PositionCard({
  position,
  emphasis = false,
  compact = false,
}: PositionCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({
    top: 0,
    left: 0,
  });

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const updatePopupPosition = useCallback(() => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      return;
    }

    const cardRect = cardElement.getBoundingClientRect();
    const viewportPadding = 16;
    const popupGap = 12;
    const popupWidth = Math.min(320, window.innerWidth - viewportPadding * 2);
    const estimatedPopupHeight = 430;

    let left = cardRect.right + popupGap;

    if (left + popupWidth > window.innerWidth - viewportPadding) {
      left = cardRect.left - popupWidth - popupGap;
    }

    if (left < viewportPadding) {
      left = cardRect.left + cardRect.width / 2 - popupWidth / 2;
    }

    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - popupWidth - viewportPadding),
    );

    let top =
      cardRect.top + cardRect.height / 2 - estimatedPopupHeight / 2;

    top = Math.max(
      viewportPadding,
      Math.min(top, window.innerHeight - estimatedPopupHeight - viewportPadding),
    );

    setPopupPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!isPopupOpen) {
      return;
    }

    function handleViewportChange() {
      updatePopupPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isPopupOpen, updatePopupPosition]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function cancelClosePopup() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openPopup() {
    cancelClosePopup();
    updatePopupPosition();
    setIsPopupOpen(true);
  }

  function closePopupWithDelay() {
    cancelClosePopup();
    closeTimerRef.current = setTimeout(() => {
      setIsPopupOpen(false);
    }, 150);
  }

  function openEditor() {
    cancelClosePopup();
    setIsPopupOpen(false);
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
      formData.set("positionKey", position.key);

      const response = await fetch("/api/organization/profile", {
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
            result?.message ??
            "Biodata belum dapat disimpan.",
        });
        return;
      }

      setFormStatus({
        type: "success",
        message:
          result?.message ?? "Biodata berhasil disimpan.",
      });

      router.refresh();
    } catch (error) {
      console.error("Submit organization profile error:", error);

      setFormStatus({
        type: "error",
        message:
          "Koneksi ke server gagal. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const popupId = `profile-popup-${position.key}`;
  const editorTitleId = `profile-editor-title-${position.key}`;

  return (
    <>
      <article
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-describedby={isPopupOpen ? popupId : undefined}
        aria-haspopup="dialog"
        onMouseEnter={openPopup}
        onMouseLeave={closePopupWithDelay}
        onFocus={openPopup}
        onBlur={closePopupWithDelay}
        onClick={openEditor}
        onKeyDown={handleCardKeyDown}
        className={[
          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden text-center",
          "rounded-xl border bg-gradient-to-br from-[#071326] via-[#0a1a33] to-[#030914]",
          "shadow-[0_14px_35px_rgba(2,8,23,0.3)] outline-none",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1.5 hover:border-yellow-400/60",
          "hover:shadow-[0_20px_45px_rgba(2,8,23,0.4),0_0_24px_rgba(234,179,8,0.12)]",
          "focus-visible:ring-2 focus-visible:ring-yellow-400",
          emphasis
            ? "min-h-40 min-w-72 border-yellow-400/80 bg-gradient-to-br from-[#101d35] via-[#071326] to-[#02060d] px-8 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_30px_rgba(234,179,8,0.12)]"
            : "border-slate-500/30 px-5 py-4",
          compact ? "min-h-28 min-w-40" : "min-h-32 min-w-52",
        ].join(" ")}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-yellow-400/10" />

        <h3
          className={[
            "relative z-10 font-extrabold uppercase leading-tight tracking-wide text-white",
            compact ? "text-sm" : "text-base",
          ].join(" ")}
        >
          {position.title}
        </h3>

        {position.subtitle ? (
          <p className="relative z-10 mt-1 font-bold uppercase tracking-wider text-yellow-300">
            {position.subtitle}
          </p>
        ) : null}

        <div className="relative z-10 mt-3 h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        <p className="relative z-10 mt-3 max-w-56 text-xs font-medium leading-relaxed text-slate-300">
          {position.name?.trim() || "Nama pejabat menyusul"}
        </p>

        <p className="relative z-10 mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          Klik untuk edit biodata
        </p>
      </article>

      {portalTarget && isPopupOpen
        ? createPortal(
            <aside
              id={popupId}
              role="tooltip"
              onMouseEnter={cancelClosePopup}
              onMouseLeave={closePopupWithDelay}
              style={{
                top: popupPosition.top,
                left: popupPosition.left,
              }}
              className="fixed z-[1000] w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-2xl border border-yellow-400/20 bg-[#061021]/95 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(30,64,175,0.18)] backdrop-blur-2xl"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#163b76] via-cyan-400 to-yellow-400" />

              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-yellow-400/40 bg-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    {position.photoUrl ? (
                      <Image
                        src={position.photoUrl}
                        alt={position.name || position.title}
                        fill
                        sizes="80px"
                        unoptimized={isDataImageUrl(position.photoUrl)}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-300">
                        {getInitials(position)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
                      {position.title}
                    </p>
                    <h4 className="mt-1 break-words text-base font-bold text-white">
                      {getDisplayValue(position.name)}
                    </h4>
                    <p className="mt-1 text-sm text-yellow-300">
                      {getDisplayValue(position.rank)}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-white/10" />

                <dl className="space-y-3 text-sm">
                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">NRP</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(position.nrp)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">TTL</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(position.birthPlaceDate)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">Pendidikan</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(position.education)}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-400">
                      Riwayat jabatan
                    </dt>
                    <dd className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line break-words leading-relaxed text-slate-100">
                      {getDisplayValue(position.careerHistory)}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>,
            portalTarget,
          )
        : null}

      {portalTarget && isEditorOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={editorTitleId}
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeEditor();
                }
              }}
            >
              <div className="max-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-yellow-400/20 bg-[#061021]/95 text-white shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
                <div className="h-1.5 bg-gradient-to-r from-[#163b76] via-cyan-400 to-yellow-400" />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
                        Edit Biodata Struktur
                      </p>
                      <h3
                        id={editorTitleId}
                        className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white"
                      >
                        {position.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={closeEditor}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                      Tutup
                    </button>
                  </div>

                  <form
                    onSubmit={handleEditorSubmit}
                    className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]"
                  >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-yellow-400/25 bg-slate-900">
                        {position.photoUrl ? (
                          <Image
                            src={position.photoUrl}
                            alt={position.name || position.title}
                            fill
                            sizes="260px"
                            unoptimized={isDataImageUrl(position.photoUrl)}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-slate-400">
                            {getInitials(position)}
                          </div>
                        )}
                      </div>

                      <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-200">
                        Foto
                        <input
                          name="photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="rounded-xl border border-white/10 bg-white/90 px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Nama lengkap
                          <input
                            name="fullName"
                            type="text"
                            required
                            defaultValue={fieldValue(position.name)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          NRP
                          <input
                            name="serviceNumber"
                            type="text"
                            defaultValue={fieldValue(position.nrp)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Pangkat
                          <input
                            name="rank"
                            type="text"
                            defaultValue={fieldValue(position.rank)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Jabatan
                          <input
                            name="positionTitle"
                            type="text"
                            required
                            defaultValue={position.title}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Tempat lahir
                          <input
                            name="birthPlace"
                            type="text"
                            defaultValue={fieldValue(position.birthPlace)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Tanggal lahir
                          <input
                            name="birthDate"
                            type="date"
                            defaultValue={fieldValue(position.birthDate)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-slate-200">
                          Pendidikan
                          <input
                            name="education"
                            type="text"
                            defaultValue={fieldValue(position.education)}
                            className="rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                          />
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-semibold text-slate-200">
                        Riwayat jabatan
                        <textarea
                          name="description"
                          rows={5}
                          defaultValue={fieldValue(position.careerHistory)}
                          className="resize-y rounded-xl border border-white/10 bg-white/90 px-4 py-3 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25"
                        />
                      </label>

                      {formStatus.message ? (
                        <div
                          role="status"
                          className={
                            formStatus.type === "success"
                              ? "rounded-xl border border-emerald-400/30 bg-emerald-950/60 px-4 py-3 text-sm font-semibold text-emerald-100"
                              : "rounded-xl border border-red-400/30 bg-red-950/60 px-4 py-3 text-sm font-semibold text-red-100"
                          }
                        >
                          {formStatus.message}
                        </div>
                      ) : null}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="rounded-xl border border-yellow-400/30 bg-gradient-to-b from-yellow-300 to-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#081225] shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.36)] disabled:cursor-not-allowed disabled:opacity-60"
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
