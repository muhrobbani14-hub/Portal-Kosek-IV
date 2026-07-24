import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUnitBySlug } from "@/server/queries/portal";

type UnitDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type UnitMenuItem = {
  title: string;
  description: string;
  href: string;
  className: string;
};

function getUnitMenuItems(unitSlug: string): UnitMenuItem[] {
  return [
    {
      title: "Struktur Organisasi",
      description: "Informasi Struktur Organisasi dan Personel",
      href: `/satrad/${unitSlug}/struktur-organisasi`,
      className: "lg:col-start-5 lg:col-end-9 lg:row-start-1",
    },
    {
      title: "Operasi",
      description: "Informasi operasi satuan",
      href: `/satrad/${unitSlug}/operasi`,
      className: "lg:col-start-1 lg:col-end-5 lg:row-start-2",
    },
    {
      title: "Latihan",
      description: "Informasi latihan satuan",
      href: `/satrad/${unitSlug}/latihan`,
      className: "lg:col-start-5 lg:col-end-9 lg:row-start-2",
    },
    {
      title: "Intelijen",
      description: "Informasi intelijen satuan",
      href: `/satrad/${unitSlug}/intelijen`,
      className: "lg:col-start-9 lg:col-end-13 lg:row-start-2",
    },
    {
      title: "Personel",
      description: "Informasi personel satuan",
      href: `/satrad/${unitSlug}/personel`,
      className: "lg:col-start-1 lg:col-end-5 lg:row-start-3",
    },
    {
      title: "Komlek",
      description: "Informasi komlek satuan",
      href: `/satrad/${unitSlug}/komlek`,
      className: "lg:col-start-5 lg:col-end-9 lg:row-start-3",
    },
    {
      title: "Logistik",
      description: "Informasi logistik satuan",
      href: `/satrad/${unitSlug}/logistik`,
      className: "lg:col-start-9 lg:col-end-13 lg:row-start-3",
    },
  ];
}

export default async function UnitDetailPage({
  params,
}: UnitDetailPageProps) {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const unitMenuItems = getUnitMenuItems(unit.slug);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18]">
      <Image
        src="/images/background/all-background.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[#071225]/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/15 via-[#07152d]/35 to-[#030713]/70" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1700px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group mb-8 inline-flex w-fit items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/75 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:bg-[#0c1c38] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-white/10 bg-white/5 text-lg transition group-hover:border-yellow-400/30 group-hover:text-yellow-300">
            &lt;
          </span>
          Kembali ke Dashboard
        </Link>

        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.38em] text-yellow-200/90">
            
          </p>
          <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-5xl">
            {unit.name}
          </h1>
          <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:grid-rows-3 lg:gap-x-16 lg:gap-y-7">
            {unitMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex min-h-28 flex-col justify-center overflow-hidden rounded-[6px] border border-white/25 bg-white/[0.16] px-6 py-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-yellow-300/70 hover:bg-white/[0.24] hover:shadow-[0_22px_60px_rgba(0,0,0,0.38)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${item.className}`}
              >
                <span className="absolute inset-x-0 top-0 h-px bg-yellow-300/0 transition group-hover:bg-yellow-300/80" />
                <span className="text-base font-extrabold uppercase tracking-[0.08em] text-white drop-shadow sm:text-lg">
                  {item.title}
                </span>
                <span className="mt-2 text-xs font-medium leading-5 text-slate-200/90 transition group-hover:text-white">
                  {item.description}
                </span>
                <span className="mx-auto mt-3 h-px w-10 bg-yellow-300/70 transition-all duration-300 group-hover:w-16" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}