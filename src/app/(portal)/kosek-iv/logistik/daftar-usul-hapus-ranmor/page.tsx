import Image from "next/image";
import Link from "next/link";

import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  getEditableTableRows,
  type EditableTableColumn,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type TableCell = {
  value: string;
  className?: string;
  colSpan?: number;
};

const headers: TableCell[] = [
  { value: "No" },
  { value: "Satuan Kerja" },
  { value: "Jeep/Sedan" },
  { value: "Truk Berat" },
  { value: "Truk Sedang" },
  { value: "Truk Kecil" },
  { value: "Mini Bus" },
  { value: "Bus Sedang" },
  { value: "SPD MTR" },
  { value: "JML" },
  { value: "Ket" },
];

const tableKey = "logistics-vehicle-deletion-proposal";

const vehicleColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "unit", label: "Satuan Kerja" },
  { key: "jeepSedan", label: "Jeep/Sedan" },
  { key: "truckHeavy", label: "Truk Berat" },
  { key: "truckMedium", label: "Truk Sedang" },
  { key: "truckSmall", label: "Truk Kecil" },
  { key: "miniBus", label: "Mini Bus" },
  { key: "busMedium", label: "Bus Sedang" },
  { key: "spdMtr", label: "SPD MTR" },
  { key: "total", label: "JML" },
  { key: "note", label: "Keterangan" },
];

const vehicleColumnKeys = vehicleColumns.map((column) => column.key);

const defaultRows: EditableTableDefaultRow[] = [];

function renderCell(cell: TableCell, cellIndex: number, header = false) {
  const Element = header ? "th" : "td";

  return (
    <Element
      key={`${cell.value}-${cellIndex}`}
      colSpan={cell.colSpan}
      className={[
        "border px-3 py-3 align-middle font-black leading-5",
        header
          ? "border-yellow-300/30 bg-[#0b2d66] text-center text-sm uppercase tracking-[0.06em] text-yellow-100"
          : "border-[#18345f]/35 text-sm text-[#071a33]",
        cellIndex === 1 || cellIndex === 10 ? "text-left" : "text-center",
        cellIndex === 1 ? "uppercase" : "",
        cell.className ?? "",
      ].join(" ")}
    >
      {cell.value}
    </Element>
  );
}

export default async function VehicleDeletionProposalPage() {
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1450px] flex-col px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="mx-auto mb-8 w-fit min-w-[280px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[520px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Logistik
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.06em] text-white drop-shadow sm:text-3xl">
                Daftar Usul Hapus Ranmor
              </h2>
            </div>

            <article className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-[#071f4b] px-4 py-3">
                <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-yellow-100 sm:text-3xl">
                  Daftar Usul Hapus Ranmor
                </h3>
                <EditableTableActions
                  tableKey={tableKey}
                  columns={vehicleColumns}
                  nextDisplayOrder={rows.length + 1}
                />
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[1120px] border-collapse bg-[#eaf1fb] text-slate-950 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.18)]">
                  <thead>
                    <tr>
                      {headers.map((cell, cellIndex) =>
                        renderCell(cell, cellIndex, true),
                      )}
                      <th className="border border-yellow-300/30 bg-[#0b2d66] px-3 py-3 text-center text-sm font-black uppercase tracking-[0.06em] text-yellow-100">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={row.rowKey}
                        className={
                          rowIndex % 2 === 0 ? "bg-[#eef4ff]" : "bg-[#e4edf9]"
                        }
                      >
                        {vehicleColumnKeys.map((key, cellIndex) => {
                          const isNihilRow = vehicleColumnKeys
                            .slice(2, 10)
                            .every((vehicleKey) => row.cells[vehicleKey] === "Nihil");

                          if (isNihilRow && cellIndex > 2 && cellIndex < 10) {
                            return null;
                          }

                          return renderCell(
                            {
                              value: isNihilRow && cellIndex === 2
                                ? "Nihil"
                                : row.cells[key] ?? "",
                              colSpan: isNihilRow && cellIndex === 2 ? 8 : undefined,
                              className:
                                isNihilRow && cellIndex === 2
                                  ? "text-center uppercase"
                                  : undefined,
                            },
                            cellIndex,
                          );
                        })}
                        <td className="border border-[#18345f]/35 px-3 py-3 align-middle">
                          <EditableTableActions
                            tableKey={tableKey}
                            columns={vehicleColumns}
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
