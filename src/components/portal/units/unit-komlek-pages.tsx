import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type UnitKomlekMenuItem = {
  title: string;
  href: string;
};

type UnitKomlekMenuProps = {
  unitName: string;
  unitSlug: string;
};

type UnitKomlekDetailShellProps = UnitKomlekMenuProps & {
  title: string;
  children: ReactNode;
};

function getUnitKomlekMenuItems(unitSlug: string): UnitKomlekMenuItem[] {
  return [
    {
      title: "Kesiapan Radar",
      href: `/satrad/${unitSlug}/komlek/kesiapan-radar`,
    },
    {
      title: "Kesiapan Palposek",
      href: `/satrad/${unitSlug}/komlek/kesiapan-palposek`,
    },
    {
      title: "Kesiapan Radio Satrad",
      href: `/satrad/${unitSlug}/komlek/kesiapan-radio-satrad`,
    },
    {
      title: "Permasalahan dan Upaya",
      href: `/satrad/${unitSlug}/komlek/permasalahan-upaya`,
    },
  ];
}

function UnitKomlekBackground() {
  return (
    <>
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
    </>
  );
}

function BackLink({ unitSlug }: { unitSlug: string }) {
  return (
    <div className="mb-6 flex justify-end">
      <Link
        href={`/satrad/${unitSlug}`}
        className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
      >
        <span className="text-lg">&lt;</span>
        Kembali
      </Link>
    </div>
  );
}

function KomlekTitle({ unitName, title }: { unitName: string; title: string }) {
  return (
    <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
        {unitName}
      </p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

export function UnitKomlekMenu({ unitName, unitSlug }: UnitKomlekMenuProps) {
  const items = getUnitKomlekMenuItems(unitSlug);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18]">
      <UnitKomlekBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1500px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <BackLink unitSlug={unitSlug} />

        <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-10 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
            <KomlekTitle unitName={unitName} title="Bidang Komlek" />

            <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex min-h-20 items-center justify-center overflow-hidden rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-yellow-300/0 transition group-hover:bg-yellow-300/80" />
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function UnitKomlekDetailShell({
  unitName,
  unitSlug,
  title,
  children,
}: UnitKomlekDetailShellProps) {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18]">
      <UnitKomlekBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1500px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link
            href={`/satrad/${unitSlug}/komlek`}
            className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
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
            <KomlekTitle unitName={unitName} title={title} />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}