import Image from "next/image";
import Link from "next/link";

import { EditableSeriesBarCharts } from "@/components/portal/organization/editable-series-bar-charts";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type AirObservationSeries = {
  key: string;
  label: string;
  colorClass: string;
};

type AirObservationRow = {
  label: string;
  values: Record<string, number>;
};

type AirObservationGroup = {
  title: string;
  series: AirObservationSeries[];
  rows: AirObservationRow[];
};

const airObservationGroups: AirObservationGroup[] = [
  {
    title: "TA 2025",
    series: [
      { key: "jml", label: "JML", colorClass: "bg-[#a3c93a]" },
      { key: "lasaT", label: "LASA T", colorClass: "bg-[#46c1a4]" },
      { key: "lasaX", label: "LASA X", colorClass: "bg-[#3d8fc5]" },
      { key: "rcVvip", label: "RC VVIP", colorClass: "bg-[#9b5cc0]" },
    ],
    rows: [
      { label: "SATRAD 401", values: { jml: 145842, lasaT: 0, lasaX: 0, rcVvip: 198 } },
      { label: "SATRAD 201T", values: { jml: 16198, lasaT: 0, lasaX: 0, rcVvip: 0 } },
      { label: "SATRAD 201W", values: { jml: 0, lasaT: 0, lasaX: 0, rcVvip: 0 } },
      { label: "SATRAD 201V", values: { jml: 26376, lasaT: 0, lasaX: 0, rcVvip: 6 } },
      { label: "SATRAD 106", values: { jml: 195241, lasaT: 6, lasaX: 0, rcVvip: 40 } },
      { label: "SATRAD 403", values: { jml: 19199, lasaT: 0, lasaX: 0, rcVvip: 42 } },
      { label: "SATRAD 404", values: { jml: 105657, lasaT: 0, lasaX: 0, rcVvip: 80 } },
      { label: "SATRAD 402", values: { jml: 40771, lasaT: 0, lasaX: 0, rcVvip: 40 } },
    ],
  },
  {
    title: "TW 1 TA 2026",
    series: [
      { key: "jml", label: "JML", colorClass: "bg-[#a3c93a]" },
      { key: "lasaT", label: "LASA T", colorClass: "bg-[#46c1a4]" },
      { key: "lasaX", label: "LASA X", colorClass: "bg-[#3d8fc5]" },
    ],
    rows: [
      { label: "SATRAD 401", values: { jml: 36446, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 402", values: { jml: 4311, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 403", values: { jml: 0, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 404", values: { jml: 21111, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 405", values: { jml: 6708, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 406 PLESSEY", values: { jml: 7816, lasaT: 0, lasaX: 0 } },
      { label: "SATRAD 406 LEO", values: { jml: 14658, lasaT: 0, lasaX: 0 } },
    ],
  },
];

function getTableKey(index: number) {
  return `operation-air-observation-${index + 1}`;
}

function getDefaultRows(
  group: AirObservationGroup,
): EditableTableDefaultRow[] {
  return group.rows.map((row, index) => ({
    rowKey: `air-observation-${index + 1}`,
    cells: {
      label: row.label,
      ...Object.fromEntries(
        group.series.map((series) => [
          series.key,
          String(row.values[series.key] ?? 0),
        ]),
      ),
    },
  }));
}

export default async function AirObservationPage() {
  const editableGroups = await Promise.all(
    airObservationGroups.map(async (group, index) => {
      const tableKey = getTableKey(index);

      return {
        title: group.title,
        tableKey,
        rows: await getEditableTableRows(
          tableKey,
          getDefaultRows(group),
        ),
        series: group.series.map((series) => ({
          key: series.key,
          label: series.label,
          className: series.colorClass,
        })),
        minWidth: "min-w-[760px]",
        variant: "dark" as const,
      };
    }),
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
            href="/organization/operasi"
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
                Bidang Operasi
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Data Pengamatan Udara
              </h2>
            </div>

            <EditableSeriesBarCharts groups={editableGroups} />
          </div>
        </section>
      </div>
    </main>
  );
}
