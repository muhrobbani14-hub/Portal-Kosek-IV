import Image from "next/image";
import Link from "next/link";

import { EditableSeriesBarCharts } from "@/components/portal/organization/editable-series-bar-charts";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type SecurityPublicationDatum = {
  month: string;
  dik: number;
  nikah: number;
  mitra: number;
};

const maxChartValue = 25;
const tableKey = "intelligence-security-publication-chart";

const securityPublicationData: SecurityPublicationDatum[] = [
  { month: "Jan-25", dik: 2, nikah: 1, mitra: 3 },
  { month: "Feb-25", dik: 5, nikah: 2, mitra: 1 },
  { month: "Mar-25", dik: 7, nikah: 0, mitra: 2 },
  { month: "Apr-25", dik: 7, nikah: 0, mitra: 5 },
  { month: "Mei-25", dik: 21, nikah: 1, mitra: 3 },
  { month: "Jun-25", dik: 6, nikah: 1, mitra: 1 },
  { month: "Jul-25", dik: 2, nikah: 2, mitra: 2 },
  { month: "Agt-25", dik: 0, nikah: 0, mitra: 2 },
  { month: "Sep-25", dik: 0, nikah: 1, mitra: 3 },
  { month: "Okt-25", dik: 6, nikah: 2, mitra: 1 },
  { month: "Nov-25", dik: 3, nikah: 4, mitra: 3 },
  { month: "Des-25", dik: 10, nikah: 1, mitra: 0 },
  { month: "Jan-26", dik: 17, nikah: 1, mitra: 1 },
  { month: "Feb-26", dik: 0, nikah: 1, mitra: 3 },
  { month: "Mar-26", dik: 3, nikah: 0, mitra: 5 },
  { month: "Apr-26", dik: 7, nikah: 1, mitra: 17 },
  { month: "Mei-26", dik: 7, nikah: 0, mitra: 12 },
  { month: "Jun-26", dik: 0, nikah: 2, mitra: 6 },
];

const chartSeries = [
  { key: "dik", label: "DIK", className: "bg-[#5c83d4]" },
  { key: "nikah", label: "NIKAH", className: "bg-[#f08a45]" },
  { key: "mitra", label: "MITRA", className: "bg-[#b7b7b7]" },
] as const;

const defaultRows: EditableTableDefaultRow[] =
  securityPublicationData.map((item, index) => ({
    rowKey: `security-publication-${index + 1}`,
    cells: {
      label: item.month,
      dik: String(item.dik),
      nikah: String(item.nikah),
      mitra: String(item.mitra),
    },
  }));

export default async function SecurityPublicationPage() {
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1500px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link
            href="/organization/intelijen"
            className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
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
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Intelijen
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Pengamanan
              </h2>
            </div>

            <EditableSeriesBarCharts
              groups={[
                {
                  title:
                    "Grafik Penerbitan SKHPP dan SKSC Tahun 2025 s.d 2026",
                  tableKey,
                  rows,
                  series: [...chartSeries],
                  maxValue: maxChartValue,
                  yAxisValues: [25, 20, 15, 10, 5, 0],
                  minWidth: "min-w-[980px]",
                },
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
