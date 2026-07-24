import Image from "next/image";
import Link from "next/link";

import { EditableTableActions } from "@/components/portal/organization/editable-table-actions";
import {
  getEditableTableRows,
  type EditableTableColumn,
  type EditableTableRow,
} from "@/lib/portal-editable-tables";

type TableCell = {
  value: string;
  className?: string;
  colSpan?: number;
};

type RecapSection = {
  title: string;
  tableKey: string;
  columns: EditableTableColumn[];
  headers: TableCell[][];
};

const moneyGrantColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "giver", label: "Pemberi Hibah" },
  { key: "name", label: "Nama Hibah/Barang" },
  { key: "unit", label: "Nama Satker" },
  { key: "value", label: "Nilai Hibah" },
  { key: "register", label: "No Register Tanggal" },
  { key: "bast", label: "BAST Nomor/Tanggal" },
  { key: "sp2hl", label: "SP2HL Nomor/Tanggal" },
  { key: "sphl", label: "SPHL Nomor/Tanggal" },
  { key: "note", label: "Keterangan" },
];

const goodsGrantColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "giver", label: "Pemberi Hibah" },
  { key: "name", label: "Nama Hibah/Barang" },
  { key: "unit", label: "Nama Satker" },
  { key: "value", label: "Nilai Hibah" },
  { key: "register", label: "No Register Tanggal" },
  { key: "bastNumber", label: "BAST Nomor" },
  { key: "bastDate", label: "BAST Tanggal" },
  { key: "sp3hlNumber", label: "SP3HLBSJ Nomor" },
  { key: "sp3hlDate", label: "SP3HLBSJ Tanggal" },
  { key: "mphlNumber", label: "MPHLBSJ Nomor" },
  { key: "mphlDate", label: "MPHLBSJ Tanggal" },
  { key: "note", label: "Keterangan" },
];

const bmpColumns: EditableTableColumn[] = [
  { key: "no", label: "No" },
  { key: "item", label: "Jenis BBMP" },
  { key: "unit", label: "Kuantum" },
  { key: "makosek", label: "Makosek IV" },
  { key: "satrad401", label: "Satrad 401 TKT" },
  { key: "satrad201", label: "Satrad 201 RNI" },
  { key: "satrad106", label: "Satrad 106 TPI" },
  { key: "satrad403", label: "Satrad 403 TGL" },
  { key: "satrad404", label: "Satrad 404 CGT" },
  { key: "satrad402", label: "Satrad 402 CBL" },
  { key: "satrudal421", label: "Satrudal 421 TGA" },
  { key: "total", label: "Jumlah" },
  { key: "note", label: "Keterangan" },
];

const sections: RecapSection[] = [
  {
    title: "Rekap Penerimaan Hibah Uang TA. 2025",
    tableKey: "logistics-recap-money-grant",
    columns: moneyGrantColumns,
    headers: [
      [
        { value: "No", colSpan: 1 },
        { value: "Pemberi", colSpan: 1 },
        { value: "Nama", colSpan: 1 },
        { value: "Nama", colSpan: 1 },
        { value: "Nilai", colSpan: 1 },
        { value: "No Register", colSpan: 1 },
        { value: "BAST", colSpan: 1 },
        { value: "SP2HL", colSpan: 1 },
        { value: "SPHL", colSpan: 1 },
        { value: "Ket", colSpan: 1 },
      ],
      ["", "Hibah", "Hibah/Barang", "Satker", "Hibah", "Tanggal", "Nomor/Tanggal", "Nomor/Tanggal", "Nomor/Tanggal", ""].map((value) => ({ value })),
    ],

  },
  {
    title: "Rekap Penerimaan Hibah Barang TA. 2025",
    tableKey: "logistics-recap-goods-grant",
    columns: goodsGrantColumns,
    headers: [
      ["No", "Pemberi", "Nama", "Nama", "Nilai", "No Register", "BAST", "", "SP3HLBSJ", "", "MPHLBSJ", "", "Ket"].map((value) => ({ value })),
      ["", "Hibah", "Hibah/Barang", "Satker", "Hibah", "Tanggal", "Nomor", "Tanggal", "Nomor", "Tanggal", "Nomor", "Tanggal", ""].map((value) => ({ value })),
    ],

  },
  {
    title: "Rekap Penerimaan & Pendistribusian BMP Darat TA. 2025",
    tableKey: "logistics-recap-bmp",
    columns: bmpColumns,
    headers: [
      [
        { value: "No" },
        { value: "Jenis BBMP" },
        { value: "Kuantum" },
        { value: "Penerimaan TA. 2025", colSpan: 8 },
        { value: "Jumlah" },
        { value: "Ket" },
      ],
      ["", "", "", "Makosek IV", "Satrad 401 TKT", "Satrad 201 RNI", "Satrad 106 TPI", "Satrad 403 TGL", "Satrad 404 CGT", "Satrad 402 CBL", "Satrudal 421 TGA", "", ""].map((value) => ({ value })),
    ],

  },
];

function renderCell(cell: TableCell, cellIndex: number, header = false) {
  const Element = header ? "th" : "td";

  return (
    <Element
      key={`${cell.value}-${cellIndex}`}
      colSpan={cell.colSpan}
      className={[
        "border px-3 py-2 text-center align-middle font-black leading-5",
        header
          ? "border-yellow-300/30 bg-[#0b2d66] text-sm uppercase text-yellow-100"
          : "border-[#18345f]/35 text-sm text-[#071a33]",
        cell.className ?? "",
      ].join(" ")}
    >
      {cell.value}
    </Element>
  );
}

function RecapTable({
  section,
  rows,
}: {
  section: RecapSection;
  rows: EditableTableRow[];
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-400/30 bg-[#071f4b] px-4 py-3">
        <h3 className="min-w-0 flex-1 text-lg font-black uppercase leading-tight tracking-[0.04em] text-yellow-100 sm:text-xl lg:text-2xl">
          {section.title}
        </h3>
        <EditableTableActions
          tableKey={section.tableKey}
          columns={section.columns}
          nextDisplayOrder={rows.length + 1}
        />
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[1180px] border-collapse bg-[#eaf1fb] text-slate-950 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.18)]">
          <thead>
            {section.headers.map((row, rowIndex) => (
              <tr
                key={`${section.title}-header-${rowIndex}`}
                className="bg-[#0b2d66] text-yellow-100"
              >
                {row.map((cell, cellIndex) => renderCell(cell, cellIndex, true))}
                {rowIndex === 0 ? (
                  <th
                    rowSpan={section.headers.length}
                    className="border border-yellow-300/30 bg-[#0b2d66] px-3 py-2 text-center text-sm font-black uppercase text-yellow-100"
                  >
                    Aksi
                  </th>
                ) : null}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.rowKey}
                className={rowIndex % 2 === 0 ? "bg-[#eef4ff]" : "bg-[#e4edf9]"}
              >
                {section.tableKey === "logistics-recap-bmp" &&
                ["A", "B"].includes(row.cells.no ?? "") ? (
                  <>
                    {renderCell({ value: row.cells.no ?? "", className: "bg-[#0b2d66] text-yellow-100" }, 0)}
                    {renderCell({ value: row.cells.item ?? "", className: "bg-[#0b2d66] text-left text-yellow-100", colSpan: 2 }, 1)}
                    {renderCell({ value: "", colSpan: 10 }, 3)}
                  </>
                ) : (
                  section.columns.map((column, cellIndex) =>
                    renderCell({ value: row.cells[column.key] ?? "" }, cellIndex),
                  )
                )}
                <td className="border border-[#18345f]/35 px-3 py-2 align-middle">
                  <EditableTableActions tableKey={section.tableKey} columns={section.columns} row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default async function LogisticsRecapPage() {
  const rowsByTableKey = new Map(
    await Promise.all(
      sections.map(async (section) => [
        section.tableKey,
        await getEditableTableRows(section.tableKey, []),
      ] as const),
    ),
  );

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

        <section className="relative overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10">
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Logistik
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Rekap
              </h2>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <RecapTable
                  key={section.title}
                  section={section}
                  rows={rowsByTableKey.get(section.tableKey) ?? []}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
