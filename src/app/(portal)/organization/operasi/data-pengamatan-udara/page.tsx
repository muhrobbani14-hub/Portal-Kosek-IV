import Image from "next/image";
import Link from "next/link";

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function getMaxValue(group: AirObservationGroup) {
  return Math.max(
    1,
    ...group.rows.flatMap((row) =>
      group.series.map((series) => row.values[series.key] ?? 0),
    ),
  );
}

function barHeight(value: number, maxValue: number) {
  return `${Math.max((value / maxValue) * 100, value > 0 ? 3 : 0)}%`;
}

function AirObservationChart({ group }: { group: AirObservationGroup }) {
  const maxValue = getMaxValue(group);

  return (
    <article className="rounded-[6px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5">
      <h3 className="rounded-[4px] border border-yellow-300/60 bg-[#1b1f25]/95 px-4 py-2 text-center text-base font-black uppercase tracking-[0.12em] text-yellow-300 shadow-[0_10px_28px_rgba(0,0,0,0.25)] sm:text-lg">
        {group.title}
      </h3>

      <div className="mt-5 overflow-x-auto pb-1">
        <div className="min-w-[760px]">
          <div className="relative h-[360px] overflow-hidden border-b border-l border-white/25 bg-[#0b2235]/85 px-5 pt-10">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:100%_20%]" />

            <div
              className="relative z-10 grid h-full items-end gap-5"
              style={{
                gridTemplateColumns: `repeat(${group.rows.length}, minmax(5rem, 1fr))`,
              }}
            >
              {group.rows.map((row) => (
                <div key={row.label} className="flex h-full flex-col justify-end">
                  <div className="flex h-full items-end justify-center gap-2">
                    {group.series.map((series) => {
                      const value = row.values[series.key] ?? 0;

                      return (
                        <div
                          key={`${row.label}-${series.key}`}
                          className="flex h-full w-4 items-end"
                          title={`${series.label}: ${formatNumber(value)}`}
                        >
                          <div
                            className={[
                              "w-full rounded-t-sm shadow-[6px_-4px_0_rgba(255,255,255,0.12),10px_-7px_12px_rgba(0,0,0,0.32)]",
                              series.colorClass,
                            ].join(" ")}
                            style={{ height: barHeight(value, maxValue) }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 min-h-10 text-center text-[11px] font-black uppercase leading-4 text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {row.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute right-4 top-16 z-20 space-y-2 text-right text-[11px] font-black uppercase text-yellow-300">
              {[...group.series].reverse().map((series) => (
                <div key={series.key} className="flex items-center justify-end gap-2">
                  <span>{series.label}</span>
                  <span className={`h-2.5 w-4 ${series.colorClass}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-x border-b border-white/25 bg-[#101722]/95 text-[10px] font-black uppercase text-yellow-300">
            <div
              className="grid border-b border-white/25"
              style={{
                gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(5rem, 1fr))`,
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

            {group.series.map((series) => (
              <div
                key={series.key}
                className="grid border-b border-white/25 last:border-b-0"
                style={{
                  gridTemplateColumns: `7rem repeat(${group.rows.length}, minmax(5rem, 1fr))`,
                }}
              >
                <div className="flex items-center gap-2 border-r border-white/25 px-2 py-1 text-white">
                  <span className={`h-2 w-4 ${series.colorClass}`} />
                  {series.label}
                </div>
                {group.rows.map((row) => (
                  <div
                    key={`${row.label}-${series.key}`}
                    className="border-r border-white/25 px-1 py-1 text-center last:border-r-0"
                  >
                    {formatNumber(row.values[series.key] ?? 0)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AirObservationPage() {
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

            <div className="grid grid-cols-1 gap-6">
              {airObservationGroups.map((group) => (
                <AirObservationChart key={group.title} group={group} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
