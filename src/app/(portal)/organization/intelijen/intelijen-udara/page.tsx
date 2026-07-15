import Image from "next/image";
import Link from "next/link";

import { EditableSeriesBarCharts } from "@/components/portal/organization/editable-series-bar-charts";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type FlightSurveillanceDatum = {
  month: string;
  value: number;
};

const maxChartValue = 30;
const tableKey = "intelligence-air-surveillance-chart";
const chartSeries = [
  { key: "value", label: "Jumlah", className: "bg-[#5c83d4]" },
];

const flightSurveillanceData: FlightSurveillanceDatum[] = [
  { month: "Jan-25", value: 12 },
  { month: "Feb-25", value: 11 },
  { month: "Mar-25", value: 19 },
  { month: "Apr-25", value: 16 },
  { month: "Mei-25", value: 25 },
  { month: "Jun-25", value: 13 },
  { month: "Jul-25", value: 12 },
  { month: "Agt-25", value: 14 },
  { month: "Sep-25", value: 8 },
  { month: "Okt-25", value: 24 },
  { month: "Nov-25", value: 26 },
  { month: "Des-25", value: 9 },
  { month: "Jan-26", value: 0 },
  { month: "Feb-26", value: 10 },
  { month: "Mar-26", value: 6 },
  { month: "Apr-26", value: 7 },
  { month: "Mei-26", value: 5 },
  { month: "Jun-26", value: 9 },
];

const defaultRows: EditableTableDefaultRow[] =
  flightSurveillanceData.map((item, index) => ({
    rowKey: `air-surveillance-${index + 1}`,
    cells: {
      label: item.month,
      value: String(item.value),
    },
  }));

export default async function AirIntelligencePage() {
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
                Intelijen Udara
              </h2>
            </div>

            <EditableSeriesBarCharts
              groups={[
                {
                  title:
                    "Grafik Pengawasan Penerbangan Militer Asing di Wilud Kosek IKN/IV via ALKI I & II Tahun 2025 s.d 2026",
                  tableKey,
                  rows,
                  series: chartSeries,
                  maxValue: maxChartValue,
                  yAxisValues: [30, 25, 20, 15, 10, 5, 0],
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
