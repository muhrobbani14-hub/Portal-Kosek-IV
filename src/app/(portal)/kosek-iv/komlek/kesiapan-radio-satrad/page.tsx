import Image from "next/image";
import Link from "next/link";

import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  komlekRadioColumns,
  komlekRadioDefaultRows,
  komlekRadioTableKey,
  komlekRadioUnits,
} from "@/lib/komlek-radio-satrad";
import { getEditableTableRows } from "@/lib/portal-editable-tables";

const satradColSpan = komlekRadioUnits.filter((unit) => unit.group === "SATRAD").length;
export default async function SatradRadioReadinessPage() {
  const rows = await getEditableTableRows(komlekRadioTableKey, komlekRadioDefaultRows);

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
            href="/kosek-iv/komlek"
            className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10">
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[460px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Komlek
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Kesiapan Radio Satrad
              </h2>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/82 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#071f4b] text-white">
                      <th
                        rowSpan={2}
                        className="w-24 border-r border-yellow-300/35 px-4 py-4 text-center text-base font-black uppercase tracking-[0.08em] text-yellow-100"
                      >
                        Radio
                      </th>
                      <th
                        colSpan={satradColSpan}
                        className="border-r border-yellow-300/35 px-5 py-3 text-center text-lg font-black uppercase tracking-[0.08em] text-yellow-100"
                      >
                        Satrad
                      </th>
                      <th
                        colSpan={1}
                        className="px-5 py-3 text-center text-lg font-black uppercase tracking-[0.08em] text-yellow-100"
                      >
                        Satrudal
                      </th>
                      <th
                        rowSpan={2}
                        className="w-36 px-4 py-3 text-center text-base font-black uppercase tracking-[0.08em] text-yellow-100"
                      >
                        Aksi
                      </th>
                    </tr>
                    <tr className="bg-[#0b2d66] text-white">
                      {komlekRadioUnits.map((unit) => (
                        <th
                          key={unit.key}
                          className="border-r border-yellow-300/30 px-4 py-3 text-center text-base font-black uppercase tracking-[0.08em] text-white last:border-r-0"
                        >
                          {unit.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, categoryIndex) => (
                      <tr
                        key={row.rowKey}
                        className={categoryIndex % 2 === 0 ? "bg-slate-100/92" : "bg-slate-200/88"}
                      >
                        <th className="border-r border-white/80 bg-[#0b2d66] px-4 py-5 text-center text-base font-black uppercase text-yellow-100">
                          {row.cells.category}
                        </th>
                        {komlekRadioUnits.map((unit) => (
                          <td
                            key={`${row.rowKey}-${unit.key}`}
                            className="border-r border-white/80 px-4 py-5 align-top text-xs font-semibold uppercase leading-5 text-slate-950 last:border-r-0"
                          >
                            <ol className="space-y-1">
                              {(row.cells[unit.key] ?? "")
                                .split("\n")
                                .filter(Boolean)
                                .map((radio, index) => (
                                <li key={`${row.rowKey}-${unit.key}-${index}`}>
                                  {row.cells.category === "VDCS"
                                    ? radio
                                    : `${index + 1}. ${radio}`}
                                </li>
                              ))}
                            </ol>
                          </td>
                        ))}
                        <td className="border-r border-white/80 px-3 py-5 align-middle last:border-r-0">
                          <EditableTableActions
                            tableKey={komlekRadioTableKey}
                            columns={komlekRadioColumns}
                            row={row}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <EditableTableActions
                tableKey={komlekRadioTableKey}
                columns={komlekRadioColumns}
                nextDisplayOrder={rows.length + 1}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
