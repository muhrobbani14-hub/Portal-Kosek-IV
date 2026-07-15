import Image from "next/image";
import Link from "next/link";

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

const maxHourValue = 10000;

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function barHeight(value: number) {
  return `${Math.max((value / maxHourValue) * 100, value > 0 ? 2 : 0)}%`;
}

function OperationHourChart({ group }: { group: OperationHourGroup }) {
  return (
    <article className="rounded-[6px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5">
      <h3 className="rounded-[4px] border border-yellow-300/60 bg-[#1b1f25]/95 px-4 py-2 text-center text-sm font-black uppercase leading-5 text-yellow-300 shadow-[0_10px_28px_rgba(0,0,0,0.25)] sm:text-base">
        {group.title}
      </h3>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="min-w-[760px]">
          <div className="relative h-[360px] border-b border-l border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:100%_20%] px-4 pt-8">
            <div className="absolute left-0 top-0 flex h-full -translate-x-3 flex-col justify-between py-1 text-[10px] font-bold text-slate-300">
              {[10000, 8000, 6000, 4000, 2000, 0].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>

            <div
              className="grid h-full items-end gap-3"
              style={{
                gridTemplateColumns: `repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
              }}
            >
              {group.rows.map((row) => (
                <div key={row.label} className="relative flex h-full items-end justify-center gap-1">
                  <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap text-base font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {row.percent}
                  </span>
                  <div className="flex h-full w-5 items-end">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-b from-[#6f95e6] to-[#2453ad] shadow-[0_0_14px_rgba(73,119,208,0.35)]"
                      style={{ height: barHeight(row.sasbinpuan) }}
                    />
                  </div>
                  <div className="flex h-full w-5 items-end">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-b from-[#ff9a55] to-[#ea640f] shadow-[0_0_14px_rgba(245,116,29,0.35)]"
                      style={{ height: barHeight(row.pencapaian) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-x border-b border-white/25 bg-[#101722]/95 text-[10px] font-black uppercase text-yellow-300">
            <div
              className="grid border-b border-white/25"
              style={{
                gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
              }}
            >
              <div className="border-r border-white/25 p-2" />
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex min-h-11 items-center justify-center border-r border-white/25 px-1 text-center last:border-r-0"
                >
                  {row.label}
                </div>
              ))}
            </div>

            <div
              className="grid border-b border-white/25"
              style={{
                gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
              }}
            >
              <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                <span className="h-2 w-4 bg-[#3d6dca]" />
                SASBINPUAN
              </div>
              {group.rows.map((row) => (
                <div
                  key={`${row.label}-sasbinpuan`}
                  className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                >
                  {formatNumber(row.sasbinpuan)}
                </div>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(4.25rem, 1fr))`,
              }}
            >
              <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                <span className="h-2 w-4 bg-[#f47a25]" />
                PENCAPAIAN
              </div>
              {group.rows.map((row) => (
                <div
                  key={`${row.label}-pencapaian`}
                  className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                >
                  {formatNumber(row.pencapaian)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function OperationHoursPage() {
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

            <div className="grid grid-cols-1 gap-6">
              {operationHourGroups.map((group) => (
                <OperationHourChart key={group.title} group={group} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
