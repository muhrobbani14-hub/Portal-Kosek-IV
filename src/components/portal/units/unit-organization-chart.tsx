"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useCanEditPortal } from "@/components/portal/portal-permissions-provider";
import type { PersonnelOption } from "@/lib/personnel-option-types";
import type { EditableTableRow } from "@/lib/portal-editable-tables";

type UnitOrganizationChartProps = {
  tableKey: string;
  rows: EditableTableRow[];
  unitName: string;
  personnelOptions?: PersonnelOption[];
};

type UnitOrganizationPosition = EditableTableRow & {
  cells: EditableTableRow["cells"] & {
    title?: string;
    name?: string;
    rank?: string;
    nrp?: string;
    birthPlace?: string;
    birthDate?: string;
    education?: string;
    careerHistory?: string;
    photoUrl?: string;
  };
};

type FormStatus = {
  type: "idle" | "success" | "error";
  message: string;
};

type PopupPosition = {
  top: number;
  left: number;
};

const CHART_PANEL_WIDTH = 1320;
const CHART_PANEL_HEIGHT = 1300;
const CHART_CANVAS_WIDTH = 1240;
const CHART_CANVAS_HEIGHT = 1220;

const positionGroups = {
  commander: ["DANSATRAD"],
  leftStaff: ["KASIOPS"],
  leftStaffChildrenTop: ["KASUBSI_MATUD", "KASUBSIKOM_PERNIKA"],
  leftStaffChildrenBottom: ["KASUBSI_DALLAT"],
  rightStaff: ["KASIHAR"],
  rightStaffChildrenTop: [
    "KASUBSI_ANT_TX",
    "KASUBSI_RP",
    "KASUBSI_KOM",
    "KASUBSI_BANTEK",
  ],
  rightStaffChildrenBottom: ["KASUBSIKOMP_DISPLAY"],
  service: ["KAURTU", "KAURDAL"],
  serviceChild: ["KASUBUR_BMN"],
  bottom: ["KA_TB", "KALAMJA", "KAKANDI", "KAKES"],
};

function getDisplayValue(value?: string | null) {
  return value?.trim() || "Belum diisi";
}

function fieldValue(value?: string | null) {
  return value ?? "";
}

function isDataImageUrl(value?: string | null) {
  return Boolean(value?.startsWith("data:"));
}

function getInitials(position: UnitOrganizationPosition) {
  const source = position.cells.name?.trim() || position.cells.title || position.rowKey;

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function formatBirthPlaceDate(position: UnitOrganizationPosition) {
  const birthPlace = position.cells.birthPlace?.trim();
  const birthDate = position.cells.birthDate?.trim();
  let formattedDate = "";

  if (birthDate) {
    const date = new Date(`${birthDate}T00:00:00`);

    if (!Number.isNaN(date.getTime())) {
      formattedDate = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
      }).format(date);
    }
  }

  return [birthPlace, formattedDate].filter(Boolean).join(", ");
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

      const maxSize = 800;
      const scale = Math.min(
        1,
        maxSize / Math.max(image.width, image.height),
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

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

          if (blob.size > 1.8 * 1024 * 1024) {
            reject(new Error("Ukuran foto masih terlalu besar."));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
              return;
            }

            reject(new Error("Foto tidak dapat diproses."));
          };
          reader.onerror = () => reject(new Error("Foto tidak dapat diproses."));
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

function toPositionMap(rows: EditableTableRow[]) {
  return new Map(
    rows.map((row) => [row.rowKey, row as UnitOrganizationPosition]),
  );
}

function usePositions(rows: EditableTableRow[]) {
  const positionMap = toPositionMap(rows);

  function getPosition(key: string) {
    const position = positionMap.get(key);

    if (!position) {
      throw new Error(`Posisi tidak ditemukan: ${key}`);
    }

    return position;
  }

  return getPosition;
}

function PositionBox({
  position,
  onEdit,
  emphasis = false,
  compact = false,
}: {
  position: UnitOrganizationPosition;
  onEdit: (position: UnitOrganizationPosition) => void;
  emphasis?: boolean;
  compact?: boolean;
}) {
  const canEdit = useCanEditPortal();
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({
    top: 0,
    left: 0,
  });
  const title = position.cells.title || position.rowKey;
  const hasPerson = Boolean(position.cells.name?.trim());
  const needsWideCompactCard =
    position.rowKey === "KASUBSIKOM_PERNIKA" ||
    position.rowKey === "KASUBSIKOMP_DISPLAY";
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const popupId = `unit-profile-popup-${position.rowKey}`;

  const updatePopupPosition = useCallback(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const cardRect = cardElement.getBoundingClientRect();
    const viewportPadding = 16;
    const popupGap = 12;
    const popupWidth = Math.min(360, window.innerWidth - viewportPadding * 2);
    const estimatedPopupHeight = 390;

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

    let top = cardRect.top + cardRect.height / 2 - estimatedPopupHeight / 2;

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

  function handleEdit() {
    setIsPopupOpen(false);
    onEdit(position);
  }

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        aria-describedby={isPopupOpen ? popupId : undefined}
        onMouseEnter={openPopup}
        onMouseLeave={closePopupWithDelay}
        onFocus={openPopup}
        onBlur={closePopupWithDelay}
        onClick={handleEdit}
        className={[
          "group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-[#071326] via-[#0a1a33] to-[#030914] text-center text-white shadow-[0_14px_35px_rgba(2,8,23,0.3)] outline-none transition-all duration-300 ease-out",
          "hover:-translate-y-1.5 hover:border-yellow-400/60 hover:shadow-[0_20px_45px_rgba(2,8,23,0.4),0_0_24px_rgba(234,179,8,0.12)] focus-visible:ring-2 focus-visible:ring-yellow-400",
          emphasis
            ? "min-h-36 min-w-64 border-yellow-400/80 px-8 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_30px_rgba(234,179,8,0.12)]"
            : "border-slate-500/30 px-4 py-4",
          compact
            ? needsWideCompactCard
              ? "min-h-24 w-48"
              : "min-h-24 w-32"
            : "min-h-32 w-44",
          canEdit ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />
        <span className="block w-full max-w-full break-words text-sm font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow [overflow-wrap:anywhere]">
          {title}
        </span>
        {position.cells.rank ? (
          <span className="mt-1 block max-w-full text-[10px] font-black uppercase leading-tight text-yellow-300">
            {position.cells.rank}
          </span>
        ) : null}
        <span className="mt-3 block max-w-40 text-xs font-medium leading-relaxed text-slate-300">
          {hasPerson ? position.cells.name : "Belum diisi"}
        </span>
        {canEdit ? (
          <span className="absolute -right-2 -top-3 rounded-[3px] border border-yellow-300/35 bg-[#07152f] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-yellow-100 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
            Edit
          </span>
        ) : null}
      </button>

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
              className="fixed z-[1000] w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-[16px] border border-yellow-400/20 bg-[#061021]/95 text-left text-white shadow-[0_24px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(30,64,175,0.18)] backdrop-blur-2xl"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#163b76] via-cyan-400 to-yellow-400" />

              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-yellow-400/40 bg-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    {position.cells.photoUrl ? (
                      <Image
                        src={position.cells.photoUrl}
                        alt={getDisplayValue(position.cells.name)}
                        fill
                        sizes="96px"
                        unoptimized={isDataImageUrl(position.cells.photoUrl)}
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
                      {title}
                    </p>
                    <h4 className="mt-1 break-words text-base font-bold text-white">
                      {getDisplayValue(position.cells.name)}
                    </h4>
                    <p className="mt-1 text-sm text-yellow-300">
                      {getDisplayValue(position.cells.rank)}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-white/10" />

                <dl className="space-y-3 text-sm">
                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">NRP/NIP</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(position.cells.nrp)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">TTL</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(formatBirthPlaceDate(position))}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] gap-3">
                    <dt className="font-semibold text-slate-400">Pendidikan</dt>
                    <dd className="break-words text-slate-100">
                      {getDisplayValue(position.cells.education)}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-400">
                      Riwayat jabatan
                    </dt>
                    <dd className="mt-1 max-h-24 overflow-y-auto whitespace-pre-line break-words leading-relaxed text-slate-100">
                      {getDisplayValue(position.cells.careerHistory)}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>,
            portalTarget,
          )
        : null}
    </>
  );
}
function StructureSectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`absolute left-0 right-0 z-20 flex items-center gap-4 ${className}`}>
      <div className="h-9 w-1 rounded-full bg-gradient-to-b from-yellow-300 to-amber-600" />
      <h2 className="shrink-0 text-sm font-extrabold uppercase tracking-[0.22em] text-[#0a1a36]">
        {children}
      </h2>
      <div className="h-px w-full bg-gradient-to-r from-amber-500/80 via-amber-400/60 to-transparent" />
    </div>
  );
}
export function UnitOrganizationChart({
  tableKey,
  rows,
  unitName,
  personnelOptions = [],
}: UnitOrganizationChartProps) {
  const router = useRouter();
  const canEdit = useCanEditPortal();
  const getPosition = usePositions(rows);
  const [editingPosition, setEditingPosition] =
    useState<UnitOrganizationPosition | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const chartViewportRef = useRef<HTMLDivElement | null>(null);
  const [chartScale, setChartScale] = useState(1);

  useEffect(() => {
    const viewportElement = chartViewportRef.current;

    if (viewportElement === null) {
      return;
    }

    const chartViewport = viewportElement;

    function updateScale() {
      const width = chartViewport.clientWidth;

      if (!width) {
        return;
      }

      setChartScale(Math.min(1, width / CHART_PANEL_WIDTH));
    }

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(chartViewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function openEditor(position: UnitOrganizationPosition) {
    if (!canEdit) {
      return;
    }

    setEditingPosition(position);
    setRemovePhoto(false);
    setFormStatus({ type: "idle", message: "" });
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }

    setEditingPosition(null);
    setRemovePhoto(false);
    setFormStatus({ type: "idle", message: "" });
  }

  function setFormFieldValue(
    form: HTMLFormElement,
    fieldName: string,
    value: string,
  ) {
    const field = form.elements.namedItem(fieldName);

    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
    }
  }

  function handlePersonnelSelect(event: ChangeEvent<HTMLSelectElement>) {
    const selectedOption = personnelOptions.find(
      (option) => option.id === event.currentTarget.value,
    );
    const form = event.currentTarget.form;

    if (!selectedOption || !form) {
      return;
    }

    setFormFieldValue(form, "name", selectedOption.name);
    setFormFieldValue(form, "rank", selectedOption.rank);
    setFormFieldValue(form, "nrp", selectedOption.nrp);
    setFormFieldValue(form, "birthPlace", selectedOption.birthPlace);
    setFormFieldValue(form, "birthDate", selectedOption.birthDate);
    setFormFieldValue(form, "education", selectedOption.education);
    setFormFieldValue(form, "careerHistory", selectedOption.careerHistory);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPosition) {
      return;
    }

    setIsSaving(true);
    setFormStatus({ type: "idle", message: "" });

    try {
      const formData = new FormData(event.currentTarget);
      const selectedPhoto = formData.get("photo");
      let photoUrl = editingPosition.cells.photoUrl ?? "";

      if (selectedPhoto instanceof File && selectedPhoto.size > 0) {
        photoUrl = await compressImageToDataUrl(selectedPhoto);
      } else if (removePhoto) {
        photoUrl = "";
      }

      const cells = {
        title: fieldValue(formData.get("title")?.toString()),
        name: fieldValue(formData.get("name")?.toString()),
        rank: fieldValue(formData.get("rank")?.toString()),
        nrp: fieldValue(formData.get("nrp")?.toString()),
        birthPlace: fieldValue(formData.get("birthPlace")?.toString()),
        birthDate: fieldValue(formData.get("birthDate")?.toString()),
        education: fieldValue(formData.get("education")?.toString()),
        careerHistory: fieldValue(formData.get("careerHistory")?.toString()),
        photoUrl,
      };

      const response = await fetch("/api/portal-table-rows", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableKey,
          rowKey: editingPosition.rowKey,
          displayOrder: editingPosition.displayOrder,
          cells,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        setFormStatus({
          type: "error",
          message: result?.message ?? "Data struktur belum dapat disimpan.",
        });
        return;
      }

      setFormStatus({
        type: "success",
        message: "Data struktur berhasil disimpan.",
      });
      router.refresh();
    } catch (error) {
      console.error("Submit unit organization profile error:", error);
      setFormStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Koneksi ke server gagal. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="w-full" aria-label={`Struktur organisasi ${unitName}`}>
        <div ref={chartViewportRef} className="pb-10">
          <div
            className="relative mx-auto"
            style={{
              width: CHART_PANEL_WIDTH * chartScale,
              height: CHART_PANEL_HEIGHT * chartScale,
              maxWidth: "100%",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[28px] border border-white/25 bg-white/[0.42] p-10 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-sm"
              style={{
                width: CHART_PANEL_WIDTH,
                height: CHART_PANEL_HEIGHT,
                transform: `scale(${chartScale})`,
                transformOrigin: "top left",
              }}
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
              <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-blue-900/10 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 bg-gradient-to-tl from-yellow-500/10 to-transparent" />

              <div
                className="relative z-10 mx-auto text-[#0a1a36]"
                style={{ width: CHART_CANVAS_WIDTH, height: CHART_CANVAS_HEIGHT }}
              >
                <div className="absolute left-[620px] top-[132px] h-[900px] w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/85 to-amber-500" />

                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                  <PositionBox
                    position={getPosition(positionGroups.commander[0])}
                    onEdit={openEditor}
                    emphasis
                  />
                </div>

                <div className="absolute left-0 right-0 top-[188px] border-t border-dashed border-[#0a1a36]/70" />
                <StructureSectionTitle className="top-[152px]">Pimpinan</StructureSectionTitle>
                <StructureSectionTitle className="top-[210px]">Staf Pembantu Pimpinan</StructureSectionTitle>

                <div className="absolute left-[336px] right-[410px] top-[304px] h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                <div className="absolute left-[160px] top-[240px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.leftStaff[0])}
                    onEdit={openEditor}
                  />
                </div>
                <div className="absolute left-[247px] top-[368px] h-8 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[82px] top-[396px] h-0.5 w-[330px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <div className="absolute left-[124px] top-[396px] h-7 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[364px] top-[396px] h-7 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[60px] top-[422px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.leftStaffChildrenTop[0])}
                    onEdit={openEditor}
                    compact
                  />
                </div>
                <div className="absolute left-[300px] top-[422px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.leftStaffChildrenTop[1])}
                    onEdit={openEditor}
                    compact
                  />
                </div>
                <div className="absolute left-[247px] top-[548px] h-9 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[180px] top-[582px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.leftStaffChildrenBottom[0])}
                    onEdit={openEditor}
                    compact
                  />
                </div>

                <div className="absolute left-[830px] top-[240px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.rightStaff[0])}
                    onEdit={openEditor}
                  />
                </div>
                <div className="absolute left-[917px] top-[368px] h-8 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[714px] top-[396px] h-0.5 w-[520px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                {[714, 864, 1014, 1164].map((left) => (
                  <div
                    key={`right-staff-line-${left}`}
                    className="absolute top-[396px] h-7 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600"
                    style={{ left }}
                  />
                ))}
                {positionGroups.rightStaffChildrenTop.map((key, index) => (
                  <div
                    key={key}
                    className="absolute top-[422px] z-10"
                    style={{ left: 650 + index * 150 }}
                  >
                    <PositionBox
                      position={getPosition(key)}
                      onEdit={openEditor}
                      compact
                    />
                  </div>
                ))}
                <div className="absolute left-[917px] top-[548px] h-9 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[854px] top-[582px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.rightStaffChildrenBottom[0])}
                    onEdit={openEditor}
                    compact
                  />
                </div>

                <div className="absolute left-0 right-0 top-[730px] border-t border-dashed border-[#0a1a36]/70" />
                <StructureSectionTitle className="top-[706px]">Staf Pelayanan</StructureSectionTitle>

                <div className="absolute left-[456px] right-[284px] top-[810px] h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <div className="absolute left-[280px] top-[746px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.service[0])}
                    onEdit={openEditor}
                  />
                </div>
                <div className="absolute left-[780px] top-[746px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.service[1])}
                    onEdit={openEditor}
                  />
                </div>
                <div className="absolute left-[867px] top-[874px] h-9 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[804px] top-[908px] z-10">
                  <PositionBox
                    position={getPosition(positionGroups.serviceChild[0])}
                    onEdit={openEditor}
                    compact
                  />
                </div>

                <div className="absolute left-[620px] top-[874px] h-[171px] w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
                <div className="absolute left-[230px] top-[1045px] h-0.5 w-[780px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                {[230, 430, 630, 830].map((left) => (
                  <div
                    key={`bottom-line-${left}`}
                    className="absolute top-[1045px] h-7 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600"
                    style={{ left }}
                  />
                ))}
                {positionGroups.bottom.map((key, index) => (
                  <div
                    key={key}
                    className="absolute top-[1071px] z-10"
                    style={{ left: 166 + index * 200 }}
                  >
                    <PositionBox
                      position={getPosition(key)}
                      onEdit={openEditor}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {portalTarget && editingPosition
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-md"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeEditor();
                }
              }}
            >
              <form
                onSubmit={(event) => void handleSubmit(event)}
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225] shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
              >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">
                      Edit Struktur Satuan
                    </p>
                    <h3 className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white">
                      {editingPosition.cells.title}
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

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    {personnelOptions.length > 0 ? (
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                          Pilih dari data personel
                        </span>
                        <select
                          defaultValue=""
                          onChange={handlePersonnelSelect}
                          className="w-full rounded-[4px] border border-yellow-400/25 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                        >
                          <option value="">Cari/pilih personel dari database</option>
                          {personnelOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Jabatan
                      </span>
                      <input
                        name="title"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.title)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Nama
                      </span>
                      <input
                        name="name"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.name)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Pangkat
                      </span>
                      <input
                        name="rank"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.rank)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        NRP/NIP
                      </span>
                      <input
                        name="nrp"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.nrp)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Tempat Lahir
                      </span>
                      <input
                        name="birthPlace"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.birthPlace)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Tanggal Lahir
                      </span>
                      <input
                        name="birthDate"
                        type="date"
                        defaultValue={fieldValue(editingPosition.cells.birthDate)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Pendidikan
                      </span>
                      <input
                        name="education"
                        type="text"
                        defaultValue={fieldValue(editingPosition.cells.education)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Riwayat Jabatan / Keterangan
                      </span>
                      <textarea
                        name="careerHistory"
                        rows={4}
                        defaultValue={fieldValue(editingPosition.cells.careerHistory)}
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/40"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.1em] text-yellow-100">
                        Foto
                      </span>
                      <input
                        name="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="w-full rounded-[4px] border border-white/15 bg-white px-3 py-2 text-xs font-medium text-slate-950 file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#071f4b] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:text-white"
                      />
                    </label>
                    {editingPosition.cells.photoUrl ? (
                      <label className="flex items-start gap-3 rounded-[4px] border border-red-300/30 bg-red-950/30 px-4 py-3 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={removePhoto}
                          onChange={(event) => setRemovePhoto(event.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-white/30 text-red-500 accent-red-500"
                        />
                        <span className="text-xs font-bold text-red-100">
                          Hapus foto saat disimpan
                        </span>
                      </label>
                    ) : null}
                  </div>

                  {editingPosition.cells.photoUrl && !removePhoto ? (
                    <div className="mt-5 flex items-center gap-4 rounded-[4px] border border-white/10 bg-white/5 p-3">
                      <div className="relative h-20 w-16 overflow-hidden rounded-[4px] bg-white/10">
                        <Image
                          src={editingPosition.cells.photoUrl}
                          alt={getDisplayValue(editingPosition.cells.name)}
                          fill
                          sizes="64px"
                          unoptimized={isDataImageUrl(editingPosition.cells.photoUrl)}
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium text-slate-300">
                        Foto tersimpan saat ini.
                      </p>
                    </div>
                  ) : null}
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
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}