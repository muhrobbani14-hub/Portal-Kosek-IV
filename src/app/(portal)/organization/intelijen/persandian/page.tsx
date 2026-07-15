import Image from "next/image";
import Link from "next/link";

import { EditableSeriesBarCharts } from "@/components/portal/organization/editable-series-bar-charts";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type CipherTrafficDatum = {
  month: string;
  masuk: number;
  keluar: number;
};

const maxChartValue = 450;
const tableKey = "intelligence-cipher-traffic-chart";

const cipherTrafficData: CipherTrafficDatum[] = [
  { month: "Jan-25", masuk: 19, keluar: 73 },
  { month: "Feb-25", masuk: 154, keluar: 71 },
  { month: "Mar-25", masuk: 170, keluar: 72 },
  { month: "Apr-25", masuk: 181, keluar: 84 },
  { month: "Mei-25", masuk: 182, keluar: 82 },
  { month: "Juni-25", masuk: 190, keluar: 88 },
  { month: "Juli-25", masuk: 187, keluar: 85 },
  { month: "Agt-25", masuk: 252, keluar: 84 },
  { month: "Sep-25", masuk: 254, keluar: 86 },
  { month: "Okt-25", masuk: 194, keluar: 80 },
  { month: "Nov-25", masuk: 391, keluar: 173 },
  { month: "Des-25", masuk: 113, keluar: 80 },
  { month: "Jan-26", masuk: 107, keluar: 75 },
  { month: "Feb-26", masuk: 95, keluar: 68 },
  { month: "Mar-26", masuk: 108, keluar: 77 },
  { month: "Apr-26", masuk: 122, keluar: 75 },
  { month: "Mei-26", masuk: 97, keluar: 67 },
  { month: "Jun-26", masuk: 100, keluar: 66 },
];

const chartSeries = [
  { key: "masuk", label: "MASUK", className: "bg-[#5c83d4]" },
  { key: "keluar", label: "KELUAR", className: "bg-[#f07b2d]" },
] as const;

const defaultRows: EditableTableDefaultRow[] = cipherTrafficData.map(
  (item, index) => ({
    rowKey: `cipher-traffic-${index + 1}`,
    cells: {
      label: item.month,
      masuk: String(item.masuk),
      keluar: String(item.keluar),
    },
  }),
);

export default async function CipherTrafficPage() {
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
                Persandian
              </h2>
            </div>

            <EditableSeriesBarCharts
              groups={[
                {
                  title: "Grafik Kawat Masuk-Keluar Tahun 2025 s.d 2026",
                  tableKey,
                  rows,
                  series: [...chartSeries],
                  maxValue: maxChartValue,
                  yAxisValues: [
                    450, 400, 350, 300, 250, 200, 150, 100, 50, 0,
                  ],
                  minWidth: "min-w-[1040px]",
                },
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
