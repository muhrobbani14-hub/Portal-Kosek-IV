import Image from "next/image";
import Link from "next/link";

type RadarReadinessItem = {
  title: string;
  subtitle: string;
  imageSrc: string;
};

const radarReadinessItems: RadarReadinessItem[] = [
  {
    title: "Satrad 401 TKT",
    subtitle: "Kesiapan radar satuan TKT",
    imageSrc: "/images/units/401%20TKT.jpg",
  },
  {
    title: "Satrad 402 CBL",
    subtitle: "Kesiapan radar satuan CBL",
    imageSrc: "/images/units/402%20CBL.jpg",
  },
  {
    title: "Satrad 403 TGL",
    subtitle: "Kesiapan radar satuan TGL",
    imageSrc: "/images/units/403%20TGL.jpg",
  },
  {
    title: "Satrad 404 CGT",
    subtitle: "Kesiapan radar satuan CGT",
    imageSrc: "/images/units/404%20CGT.jpg",
  },
  {
    title: "Satrad 405 PLO",
    subtitle: "Kesiapan radar satuan PLO",
    imageSrc: "/images/units/405%20PLO.jpg",
  },
  {
    title: "Satrad 406 NLI",
    subtitle: "Kesiapan radar satuan NLI",
    imageSrc: "/images/units/406%20NLI.jpg",
  },
  {
    title: "Satrad 406 Unit Pacitan",
    subtitle: "Kesiapan radar unit Pacitan",
    imageSrc: "/images/units/406%20Unit%20Pacitan.jpg",
  },
  {
    title: "Satrudal 421 TGA",
    subtitle: "Kesiapan radar Satrudal 421 TGA",
    imageSrc: "/images/units/Satrudal%20421%20TGA.jpg",
  },
];

export default function RadarReadinessPage() {
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
            href="/organization/komlek"
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
                Bidang Komlek
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Kesiapan Radar
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {radarReadinessItems.map((item, index) => (
                <details
                  key={item.title}
                  className="group overflow-hidden rounded-[8px] border border-yellow-400/30 bg-[#061225]/88 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.05] marker:hidden">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border border-yellow-300/40 bg-yellow-300/90 text-sm font-black text-[#061225] shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-black uppercase tracking-[0.08em] text-white">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-slate-300">
                          {item.subtitle}
                        </span>
                      </span>
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-white/15 bg-white/5 text-xl font-black text-yellow-200 transition group-open:rotate-45 group-hover:border-yellow-300/50">
                      +
                    </span>
                  </summary>

                  <div className="border-t border-white/10 bg-[#030b18]/55 p-4 sm:p-5">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[6px] border border-white/15 bg-[#020713] shadow-[0_22px_60px_rgba(0,0,0,0.42)]">
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 1400px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
