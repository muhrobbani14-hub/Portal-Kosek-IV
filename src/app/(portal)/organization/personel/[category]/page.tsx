import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPersonnelCategory,
  personnelCategories,
} from "@/lib/personnel-data";
import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  getEditableTableRows,
  type EditableTableColumn,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

const columns = [
  { label: "No", className: "w-14 text-center" },
  { label: "Nama / TTL", className: "min-w-80" },
  { label: "Pangkat / TMT", className: "min-w-44" },
  { label: "Korps / Jur", className: "min-w-36" },
  { label: "NRP / NIP", className: "min-w-36" },
  { label: "Jabatan / Jawatan", className: "min-w-96" },
] as const;

const editableColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "nama", label: "Nama" },
  { key: "tempatTanggalLahir", label: "Tempat, Tanggal Lahir" },
  { key: "pangkat", label: "Pangkat" },
  { key: "pangkatTmt", label: "TMT Pangkat" },
  { key: "korps", label: "Korps" },
  { key: "jurusan", label: "Jurusan" },
  { key: "nrpNip", label: "NRP / NIP" },
  { key: "jabatan", label: "Jabatan" },
  { key: "jawatan", label: "Jawatan" },
];

function StackedCell({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: {
  primary: string;
  secondary: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-yellow-200/80">
          {primaryLabel}
        </p>
        <p className="mt-1 font-semibold text-slate-100">{primary || "-"}</p>
      </div>
      <div className="border-t border-white/10 pt-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {secondaryLabel}
        </p>
        <p className="mt-1 text-slate-200">{secondary || "-"}</p>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return personnelCategories.map((category) => ({
    category: category.slug,
  }));
}

export default async function PersonnelCategoryPage({
  params,
}: PageProps<"/organization/personel/[category]">) {
  const { category: categorySlug } = await params;
  const category = getPersonnelCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const tableKey = `personnel-${category.slug}`;
  const defaultRows: EditableTableDefaultRow[] = category.rows.map((row) => ({
    rowKey: `${category.slug}-${row.no}`,
    cells: row,
  }));
  const rows = await getEditableTableRows(tableKey, defaultRows);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18]">
      <Image
        src="/images/background/gedung kosek IV.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#041022]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/25 via-[#0a1a36]/55 to-[#030713]/90" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1600px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap justify-end gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/organization/personel"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
            >
              <span className="text-lg">&lt;</span>
              Kembali
            </Link>
            <Link
              href={`/documents/${category.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2.5 text-sm font-bold text-yellow-100 shadow-lg backdrop-blur-xl transition hover:border-yellow-300 hover:bg-yellow-400/20"
            >
              File Asli
            </Link>
          </div>
        </div>

        <section className="relative flex-1 overflow-hidden rounded-[6px] border border-white/10 bg-[#061225]/80 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />

          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-200">
                Total {rows.length} personel
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Tampilan Web
              </p>
            </div>
          </div>

          <div className="max-h-[calc(100vh-15rem)] overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#0a1730] text-xs font-black uppercase tracking-[0.12em] text-yellow-100">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.label}
                      className={[
                        "border-b border-r border-white/10 px-4 py-3 last:border-r-0",
                        column.className,
                      ].join(" ")}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="w-36 border-b px-4 py-3 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowKey}
                    className="odd:bg-white/[0.035] even:bg-white/[0.015] hover:bg-yellow-400/10"
                  >
                    <td className="w-14 border-b border-r border-white/10 px-4 py-3 text-center align-top font-bold text-slate-100">
                      {row.cells.no || "-"}
                    </td>
                    <td className="min-w-80 border-b border-r border-white/10 px-4 py-3 align-top text-slate-100">
                      <StackedCell
                        primary={row.cells.nama ?? ""}
                        secondary={row.cells.tempatTanggalLahir ?? ""}
                        primaryLabel="Nama"
                        secondaryLabel="Tempat Tanggal Lahir"
                      />
                    </td>
                    <td className="min-w-44 border-b border-r border-white/10 px-4 py-3 align-top text-slate-100">
                      <StackedCell
                        primary={row.cells.pangkat ?? ""}
                        secondary={row.cells.pangkatTmt ?? ""}
                        primaryLabel="Pangkat"
                        secondaryLabel="TMT"
                      />
                    </td>
                    <td className="min-w-36 border-b border-r border-white/10 px-4 py-3 align-top text-slate-100">
                      <StackedCell
                        primary={row.cells.korps ?? ""}
                        secondary={row.cells.jurusan ?? ""}
                        primaryLabel="Korps"
                        secondaryLabel="Jur"
                      />
                    </td>
                    <td className="min-w-36 border-b border-r border-white/10 px-4 py-3 align-top font-semibold text-slate-100">
                      {row.cells.nrpNip || "-"}
                    </td>
                    <td className="min-w-96 border-b border-white/10 px-4 py-3 align-top text-slate-100">
                      <StackedCell
                        primary={row.cells.jabatan ?? ""}
                        secondary={row.cells.jawatan ?? ""}
                        primaryLabel="Jabatan"
                        secondaryLabel="Jawatan"
                      />
                    </td>
                    <td className="border-b border-l border-white/10 px-3 py-3 align-top">
                      <EditableTableActions
                        tableKey={tableKey}
                        columns={editableColumns}
                        row={row}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 px-5 py-4 text-right sm:px-6">
            <EditableTableActions
              tableKey={tableKey}
              columns={editableColumns}
              nextDisplayOrder={rows.length + 1}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
