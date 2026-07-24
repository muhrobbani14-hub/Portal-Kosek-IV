import Image from "next/image";
import Link from "next/link";

import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  getEditableTableRows,
  type EditableTableColumn,
  type EditableTableDefaultRow,
  type EditableTableRow,
} from "@/lib/portal-editable-tables";

const bangfasColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "activity", label: "Uraian Kegiatan" },
  { key: "value", label: "Nilai Kontrak" },
  { key: "vendor", label: "Penyedia Jasa" },
  { key: "contractNumber", label: "Nomor Kontrak" },
  { key: "contractDate", label: "Tanggal Kontrak" },
  { key: "spmkNumber", label: "Nomor SPMK" },
  { key: "spmkDate", label: "Tanggal SPMK" },
  { key: "duration", label: "Waktu Pelaksanaan" },
  { key: "start", label: "Mulai" },
  { key: "end", label: "Selesai" },
];

const bangfas2025Columns = bangfasColumns.filter(
  (column) => column.key !== "duration",
);

const bangfas2026DefaultRows: EditableTableDefaultRow[] = [];

function BangfasTable2025({ rows }: { rows: EditableTableRow[] }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-[#071f4b] px-4 py-3">
        <h3 className="min-w-0 flex-1 text-lg font-black uppercase leading-tight tracking-[0.04em] text-yellow-100 sm:text-xl lg:text-2xl">
          Bangfas Kosek IV Tahun 2025
        </h3>
        <EditableTableActions
          tableKey="logistics-bangfas-2025"
          columns={bangfas2025Columns}
          nextDisplayOrder={rows.length + 1}
        />
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[1180px] border-collapse bg-[#eaf1fb] text-[#071a33] shadow-[inset_0_0_0_1px_rgba(250,204,21,0.18)]">
          <thead>
            <tr className="bg-[#0b2d66] text-yellow-100">
              <th rowSpan={2} className="w-20 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                No
              </th>
              <th rowSpan={2} className="border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Uraian Kegiatan
              </th>
              <th rowSpan={2} className="w-36 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nilai Kontrak
              </th>
              <th rowSpan={2} className="w-44 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Penyedia Jasa
              </th>
              <th rowSpan={2} className="w-44 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nomor dan Tanggal Kontrak
              </th>
              <th rowSpan={2} className="w-44 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nomor dan Tanggal SPMK
              </th>
              <th colSpan={2} className="w-56 border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Waktu Pelaksanaan
              </th>
              <th rowSpan={2} className="w-36 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Aksi
              </th>
            </tr>
            <tr className="bg-[#0b2d66] text-yellow-100">
              <th className="border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Mulai
              </th>
              <th className="border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Selesai
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <BangfasTableRow
                key={row.rowKey}
                row={row}
                index={index}
                tableKey="logistics-bangfas-2025"
                showDuration={false}
              />
            ))}
            {rows.length === 0 ? (
              <tr className="bg-[#eef4ff]">
                <td colSpan={9} className="h-[320px] border border-[#18345f]/35 px-4 py-4 text-center text-6xl font-black uppercase tracking-[0.55em] text-[#071a33] drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)] sm:text-7xl">
                  Nihil
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function BangfasTableRow({
  row,
  index,
  tableKey,
  showDuration = true,
}: {
  row: EditableTableRow;
  index: number;
  tableKey: string;
  showDuration?: boolean;
}) {
  return (
    <tr className={index % 2 === 0 ? "bg-[#eef4ff]" : "bg-[#e4edf9]"}>
      <td className="border border-[#18345f]/35 px-2 py-4 text-center text-sm font-black">{row.cells.no}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-sm font-semibold leading-5">{row.cells.activity}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-black">{row.cells.value}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-semibold leading-5">{row.cells.vendor}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-semibold leading-6"><span className="block">{row.cells.contractNumber}</span><span className="block">{row.cells.contractDate}</span></td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-semibold leading-6"><span className="block">{row.cells.spmkNumber}</span><span className="block">{row.cells.spmkDate}</span></td>
      {showDuration ? <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-black">{row.cells.duration}</td> : null}
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-semibold">{row.cells.start}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 text-center text-sm font-semibold">{row.cells.end}</td>
      <td className="border border-[#18345f]/35 px-3 py-4 align-middle"><EditableTableActions tableKey={tableKey} columns={showDuration ? bangfasColumns : bangfas2025Columns} row={row} /></td>
    </tr>
  );
}

function BangfasTable2026({ rows }: { rows: EditableTableRow[] }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-[#071f4b] px-4 py-3">
        <h3 className="min-w-0 flex-1 text-lg font-black uppercase leading-tight tracking-[0.04em] text-yellow-100 sm:text-xl lg:text-2xl">
          Bangfas Tersalur Kosek IV Tahun 2026
        </h3>
        <EditableTableActions tableKey="logistics-bangfas-2026" columns={bangfasColumns} nextDisplayOrder={rows.length + 1} />
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[1260px] border-collapse bg-[#eaf1fb] text-[#071a33] shadow-[inset_0_0_0_1px_rgba(250,204,21,0.18)]">
          <thead>
            <tr className="bg-[#0b2d66] text-yellow-100">
              <th rowSpan={2} className="w-14 border border-yellow-300/30 px-2 py-4 text-sm font-black uppercase">
                No
              </th>
              <th rowSpan={2} className="w-[25rem] border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Uraian Kegiatan
              </th>
              <th rowSpan={2} className="w-32 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nilai Kontrak
              </th>
              <th rowSpan={2} className="w-40 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Penyedia Jasa
              </th>
              <th rowSpan={2} className="w-40 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nomor dan Tanggal Kontrak
              </th>
              <th rowSpan={2} className="w-40 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Nomor dan Tanggal SPMK
              </th>
              <th rowSpan={2} className="w-24 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Waktu Pelaksanaan
              </th>
              <th colSpan={2} className="w-48 border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Waktu Pelaksanaan
              </th>
              <th rowSpan={2} className="w-36 border border-yellow-300/30 px-3 py-4 text-sm font-black uppercase">
                Aksi
              </th>
            </tr>
            <tr className="bg-[#0b2d66] text-yellow-100">
              <th className="border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Mulai
              </th>
              <th className="border border-yellow-300/30 px-3 py-2 text-sm font-black uppercase">
                Selesai
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => <BangfasTableRow key={row.rowKey} row={row} index={index} tableKey="logistics-bangfas-2026" />)}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default async function BangfasPage() {
  const [bangfas2025Rows, bangfas2026Rows] = await Promise.all([
    getEditableTableRows("logistics-bangfas-2025", []),
    getEditableTableRows("logistics-bangfas-2026", bangfas2026DefaultRows),
  ]);
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
      <div className="absolute inset-0 bg-[#041022]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/25 via-[#0a1a36]/45 to-[#030713]/80" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1500px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link
            href="/kosek-iv/logistik"
            className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative flex flex-1 flex-col overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10">
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Logistik
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Bangfas
              </h2>
            </div>

            <div className="space-y-8">
              <BangfasTable2025 rows={bangfas2025Rows} />
              <BangfasTable2026 rows={bangfas2026Rows} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
