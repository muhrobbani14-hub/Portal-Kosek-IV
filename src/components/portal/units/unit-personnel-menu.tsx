import Image from "next/image";
import Link from "next/link";

import type { EditableTableRow } from "@/lib/portal-editable-tables";
import type { PersonnelCategory } from "@/lib/personnel-data";

type UnitPersonnelPreview = {
  category: PersonnelCategory;
  rows: EditableTableRow[];
};

type UnitPersonnelMenuProps = {
  unitName: string;
  unitSlug: string;
  previews: UnitPersonnelPreview[];
};

function PersonnelPreview({ rows, title }: { rows: EditableTableRow[]; title: string }) {
  return (
    <div className="pointer-events-none absolute left-0 top-full z-[80] mt-4 w-[min(28rem,calc(100vw-3rem))] origin-top rounded-[6px] border border-yellow-400/35 bg-[#061225]/95 p-4 text-left opacity-0 shadow-[0_22px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 sm:-left-3 sm:w-[30rem] sm:translate-y-2 sm:scale-95">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200">
          Preview Data {title}
        </p>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
          Editable
        </span>
      </div>

      <div className="overflow-hidden rounded-[4px] border border-white/10">
        <div className="grid grid-cols-[2.5rem_1.3fr_0.8fr_1.2fr] bg-white/10 text-[10px] font-black uppercase tracking-[0.1em] text-slate-200">
          <span className="border-r border-white/10 px-2 py-2">No</span>
          <span className="border-r border-white/10 px-2 py-2">Nama</span>
          <span className="border-r border-white/10 px-2 py-2">Pangkat</span>
          <span className="px-2 py-2">Jabatan/Jawatan</span>
        </div>

        {rows.length ? (
          rows.slice(0, 3).map((row) => (
            <div
              key={row.rowKey}
              className="grid grid-cols-[2.5rem_1.3fr_0.8fr_1.2fr] border-t border-white/10 text-[11px] font-semibold leading-4 text-slate-100"
            >
              <span className="border-r border-white/10 px-2 py-2 text-slate-300">
                {row.cells.no || "-"}
              </span>
              <span className="border-r border-white/10 px-2 py-2">
                {row.cells.nama || "-"}
              </span>
              <span className="border-r border-white/10 px-2 py-2">
                {row.cells.pangkat || "-"}
              </span>
              <span className="px-2 py-2">
                {row.cells.jabatan || "-"}
                <span className="mt-1 block border-t border-white/10 pt-1 text-[10px] text-slate-300">
                  {row.cells.jawatan || "-"}
                </span>
              </span>
            </div>
          ))
        ) : (
          <div className="border-t border-white/10 px-3 py-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
            Belum ada data
          </div>
        )}
      </div>
    </div>
  );
}

export function UnitPersonnelMenu({
  unitName,
  unitSlug,
  previews,
}: UnitPersonnelMenuProps) {
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
            href={`/units/${unitSlug}`}
            className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative flex flex-1 items-center justify-center overflow-visible rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-10 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
            <div className="relative z-10 min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                {unitName}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Bidang Personel
              </h2>
            </div>

            <div className="mt-10 grid w-full grid-cols-1 gap-10 sm:mt-12 sm:grid-cols-2 sm:gap-x-28 sm:gap-y-24">
              {previews.map(({ category, rows }, index) => (
                <Link
                  key={category.slug}
                  href={`/units/${unitSlug}/personel/${category.slug}`}
                  className={[
                    "group relative flex min-h-20 w-full max-w-72 items-center justify-center rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:z-[70] hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b] focus-visible:z-[70] sm:w-72",
                    index % 2 === 0 ? "sm:justify-self-start" : "sm:justify-self-end",
                  ].join(" ")}
                >
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                    {category.title}
                  </span>
                  <PersonnelPreview rows={rows} title={category.title} />
                </Link>
              ))}
            </div>

            <Link
              href={`/units/${unitSlug}/personel/permasalahan-upaya`}
              className="group mt-10 flex min-h-20 w-full max-w-80 items-center justify-center rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b]"
            >
              <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                Permasalahan dan Upaya
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
