import Image from "next/image";
import Link from "next/link";

import { RadarReadinessCards } from "@/components/portal/organization/radar-readiness-cards";
import { prisma } from "@/lib/prisma";

const radarUnitSlugs = [
  "401-tkt",
  "402-cbl",
  "403-tgl",
  "404-cgt",
  "405-plo",
  "406-nli",
  "406-unit-pacitan",
  "407-tla",
  "421-tga",
];

export default async function RadarReadinessPage() {
  const units = await prisma.unit.findMany({
    where: {
      slug: {
        in: radarUnitSlugs,
      },
      isActive: true,
    },
    select: {
      id: true,
      code: true,
      name: true,
      equipmentName: true,
      installationYear: true,
      psrCondition: true,
      psrRange: true,
      ssrCondition: true,
      ssrRange: true,
      description: true,
      imageUrl: true,
      slug: true,
    },
  });

  const unitsBySlug = new Map(
    units.map((unit) => [unit.slug, unit]),
  );
  const orderedUnits = radarUnitSlugs
    .map((slug) => unitsBySlug.get(slug))
    .filter((unit): unit is NonNullable<typeof unit> =>
      Boolean(unit),
    )
    .map((unit) => ({
      ...unit,
      imageUrl: unit.imageUrl?.startsWith("data:") ? unit.imageUrl : null,
    }));

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

            <RadarReadinessCards units={orderedUnits} />
          </div>
        </section>
      </div>
    </main>
  );
}
