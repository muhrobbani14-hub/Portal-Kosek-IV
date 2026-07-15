import Image from "next/image";
import Link from "next/link";

import { EditableOperationHoursCharts } from "@/components/portal/organization/editable-operation-hours-charts";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type OperationHourRow = {
  label: string;
  sasbinpuan: number;
  pencapaian: number;
  percent: string;
};

type OperationHourGroup = {
  title: string;
  rows: OperationHourRow[];
};

const operationHourGroups: OperationHourGroup[] = [
  {
    title:
      "PENCAPAIAN JAM OPS S.D. 31 DES 2025 = 40.099 / 87,13% DARI SASBINPUAN 46.022",
    rows: [
      { label: "POSEK IKN", sasbinpuan: 8760, pencapaian: 8760, percent: "100 %" },
      { label: "SATRAD 401", sasbinpuan: 5704, pencapaian: 5582, percent: "97,86 %" },
      { label: "SATRAD 201T", sasbinpuan: 2820, pencapaian: 2345, percent: "83,15 %" },
      { label: "SATRAD 201W", sasbinpuan: 948, pencapaian: 0, percent: "0 %" },
      { label: "SATRAD 201V", sasbinpuan: 5634, pencapaian: 5556, percent: "98,61 %" },
      { label: "SATRAD 106", sasbinpuan: 6646, pencapaian: 4732, percent: "71,20 %" },
      { label: "SATRAD 403", sasbinpuan: 3826, pencapaian: 1893, percent: "49,47 %" },
      { label: "SATRAD 404", sasbinpuan: 3806, pencapaian: 3772, percent: "98,37 %" },
      { label: "SATRAD 402", sasbinpuan: 6626, pencapaian: 6207, percent: "93,67 %" },
      { label: "SATRUDAL 421", sasbinpuan: 1252, pencapaian: 1252, percent: "100 %" },
    ],
  },
  {
    title:
      "PENCAPAIAN JAM OPS S.D. 31 MARET 2026 = 7.554 / 17,45% DARI SASBINPUAN 43.270",
    rows: [
      { label: "POSEK IKN", sasbinpuan: 8760, pencapaian: 2160, percent: "24,66 %" },
      { label: "SATRAD 401", sasbinpuan: 5704, pencapaian: 1398, percent: "24,51 %" },
      { label: "SATRAD 402", sasbinpuan: 6626, pencapaian: 656, percent: "9,9 %" },
      { label: "SATRAD 403", sasbinpuan: 3826, pencapaian: 0, percent: "0 %" },
      { label: "SATRAD 404", sasbinpuan: 3806, pencapaian: 799, percent: "20,99 %" },
      { label: "SATRAD 405", sasbinpuan: 3806, pencapaian: 836, percent: "21,96 %" },
      {
        label: "SATRAD 406 Plessey",
        sasbinpuan: 3806,
        pencapaian: 885,
        percent: "23,25 %",
      },
      {
        label: "SATRAD 406 Leonardo",
        sasbinpuan: 5684,
        pencapaian: 820,
        percent: "14,43 %",
      },
      { label: "SATRUDAL 421", sasbinpuan: 1252, pencapaian: 280, percent: "22,36 %" },
    ],
  },
];

function getTableKey(index: number) {
  return `operation-hours-${index + 1}`;
}

function getDefaultRows(
  group: OperationHourGroup,
): EditableTableDefaultRow[] {
  return group.rows.map((row, index) => ({
    rowKey: `operation-hour-${index + 1}`,
    cells: {
      label: row.label,
      sasbinpuan: String(row.sasbinpuan),
      pencapaian: String(row.pencapaian),
      percent: row.percent,
    },
  }));
}

export default async function OperationHoursPage() {
  const editableGroups = await Promise.all(
    operationHourGroups.map(async (group, index) => {
      const tableKey = getTableKey(index);

      return {
        title: group.title,
        tableKey,
        rows: await getEditableTableRows(
          tableKey,
          getDefaultRows(group),
        ),
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
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Operasi
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Jam Operasi
              </h2>
            </div>

            <EditableOperationHoursCharts groups={editableGroups} />
          </div>
        </section>
      </div>
    </main>
  );
}
