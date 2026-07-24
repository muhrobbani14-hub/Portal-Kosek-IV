import Image from "next/image";
import Link from "next/link";

import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  getEditableTableRows,
  type EditableTableColumn,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

const tableKey = "logistics-simak-bmn";

const simakColumns: EditableTableColumn[] = [
  { key: "activity", label: "Uraian Kegiatan" },
  { key: "amount", label: "Jumlah / Tahun" },
  { key: "note", label: "Keterangan" },
];

const defaultRows: EditableTableDefaultRow[] = [];

export default async function SimakBmnPage() {
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
      <div className="absolute inset-0 bg-[#041022]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/25 via-[#0a1a36]/45 to-[#030713]/80" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1350px] flex-col px-4 py-8 sm:px-6 lg:px-8">
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
                SIMAK BMN
              </h2>
            </div>

            <article className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-[#071f4b] px-4 py-3">
                <h3 className="text-center text-2xl font-black uppercase tracking-[0.04em] text-yellow-100 sm:text-3xl">
                  Daftar Kegiatan SIMAK BMN
                </h3>
                <EditableTableActions
                  tableKey={tableKey}
                  columns={simakColumns}
                  nextDisplayOrder={rows.length + 1}
                />
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[980px] border-collapse bg-[#eaf1fb] text-[#071a33] shadow-[inset_0_0_0_1px_rgba(250,204,21,0.18)]">
                  <thead>
                    <tr className="bg-[#0b2d66] text-yellow-100">
                      <th className="w-20 border border-yellow-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em]">
                        No
                      </th>
                      <th className="border border-yellow-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em]">
                        Uraian Kegiatan
                      </th>
                      <th className="w-48 border border-yellow-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em]">
                        Jumlah / Tahun
                      </th>
                      <th className="w-52 border border-yellow-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em]">
                        Ket
                      </th>
                      <th className="w-36 border border-yellow-300/30 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={row.rowKey}
                        className={
                          index % 2 === 0 ? "bg-[#eef4ff]" : "bg-[#e4edf9]"
                        }
                      >
                        <td className="border border-[#18345f]/35 px-4 py-4 text-center text-base font-black">
                          {index + 1}
                        </td>
                        <td className="border border-[#18345f]/35 px-4 py-4 text-base font-semibold leading-7">
                          {row.cells.activity}
                        </td>
                        <td className="border border-[#18345f]/35 px-4 py-4 text-center text-base font-black">
                          {row.cells.amount}
                        </td>
                        <td className="border border-[#18345f]/35 px-4 py-4 text-center text-base font-black">
                          <span className="inline-flex min-w-36 justify-center rounded-[4px] border border-yellow-400/35 bg-[#0b2d66]/90 px-3 py-2 text-sm uppercase tracking-[0.06em] text-yellow-100">
                            {row.cells.note}
                          </span>
                        </td>
                        <td className="border border-[#18345f]/35 px-3 py-4 align-middle">
                          <EditableTableActions
                            tableKey={tableKey}
                            columns={simakColumns}
                            row={row}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
