import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { personnelCategories, type PersonnelCategory } from "@/lib/personnel-data";

const organizationFields = {
  operasi: {
    title: "Bidang Operasi",
    description: "Halaman penjelasan Bidang Operasi KOSEK IV.",
  },
  intelijen: {
    title: "Bidang Intelijen",
    description: "Halaman penjelasan Bidang Intelijen KOSEK IV.",
  },
  latihan: {
    title: "Bidang Latihan",
    description: "Halaman penjelasan Bidang Latihan KOSEK IV.",
  },
  personel: {
    title: "Bidang Personel",
    description: "Halaman penjelasan Bidang Personel KOSEK IV.",
  },
  logistik: {
    title: "Bidang Logistik",
    description: "Halaman penjelasan Bidang Logistik KOSEK IV.",
  },
  komlek: {
    title: "Bidang Komlek",
    description: "Halaman penjelasan Bidang Komlek KOSEK IV.",
  },
} as const;

type OrganizationFieldSlug = keyof typeof organizationFields;

type FieldMenuItem = {
  title: string;
  href: string;
};

const operationMenuItems = [
  {
    title: "Operasi",
    href: "/organization/operasi/operasi",
  },
  {
    title: "Jam Operasi",
    href: "/organization/operasi/jam-operasi",
  },
  {
    title: "Data Pengamatan Udara",
    href: "/organization/operasi/data-pengamatan-udara",
  },
  {
    title: "Permasalahan dan Upaya",
    href: "/organization/operasi/permasalahan-upaya",
  },
];

const intelligenceMenuItems = [
  {
    title: "Intelijen Udara",
    href: "/organization/intelijen/intelijen-udara",
  },
  {
    title: "Pengamanan",
    href: "/organization/intelijen/pengamanan",
  },
  {
    title: "Persandian",
    href: "/organization/intelijen/persandian",
  },
  {
    title: "Permasalahan dan Upaya",
    href: "/organization/intelijen/permasalahan-upaya",
  },
];

const trainingMenuItems = [
  {
    title: "TA 2025",
    href: "/organization/latihan/ta-2025",
  },
  {
    title: "TA 2026",
    href: "/organization/latihan/ta-2026",
  },
  {
    title: "Permasalahan dan Upaya",
    href: "/organization/latihan/permasalahan-upaya",
  },
];

const personnelMenuItems = personnelCategories.map((category) => ({
  title: category.title,
  href: `/organization/personel/${category.slug}`,
  category,
}));

const logisticsMenuItems = [
  {
    title: "Rekap",
    href: "/organization/logistik/rekap",
  },
  {
    title: "Daftar Usul Hapus Ranmor",
    href: "/organization/logistik/daftar-usul-hapus-ranmor",
  },
  {
    title: "SIMAK BMN",
    href: "/organization/logistik/simak-bmn",
  },
  {
    title: "Bangfas",
    href: "/organization/logistik/bangfas",
  },
  {
    title: "Permasalahan dan Upaya",
    href: "/organization/logistik/permasalahan-upaya",
  },
];

const communicationElectronicsMenuItems = [
  {
    title: "Kesiapan Radar",
    href: "/organization/komlek/kesiapan-radar",
  },
  {
    title: "Kesiapan Palposek",
    href: "/organization/komlek/kesiapan-palposek",
  },
  {
    title: "Kesiapan Radio Satrad",
    href: "/organization/komlek/kesiapan-radio-satrad",
  },
  {
    title: "Permasalahan dan Upaya",
    href: "/organization/komlek/permasalahan-upaya",
  },
];

function FieldMenuPage({
  title,
  items,
}: {
  title: string;
  items: FieldMenuItem[];
}) {
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
            href="/organization"
            className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-10 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
            <div className="relative z-10 min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Komando Sektor IV
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                {title}
              </h2>
            </div>

            <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item, index) => {
                const isCenteredLastItem =
                  items.length % 2 === 1 && index === items.length - 1;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "group relative flex min-h-20 items-center justify-center overflow-hidden rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300",
                      isCenteredLastItem
                        ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.5rem)]"
                        : "",
                    ].join(" ")}
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-yellow-300/0 transition group-hover:bg-yellow-300/80" />
                    <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SplitGridFieldPage({
  title,
  items,
}: {
  title: string;
  items: FieldMenuItem[];
}) {
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
            href="/organization"
            className="inline-flex items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-10 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
            <div className="relative z-10 min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Komando Sektor IV
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                {title}
              </h2>
            </div>

            <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-7">
              {items.map((item, index) => {
                const isCenteredItem = index === 2;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "group relative flex min-h-20 items-center justify-center overflow-hidden rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300",
                      isCenteredItem
                        ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)]"
                        : "",
                    ].join(" ")}
                  >
                    <span className="absolute inset-x-0 top-0 h-px bg-yellow-300/0 transition group-hover:bg-yellow-300/80" />
                    <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PersonnelPreview({ category }: { category: PersonnelCategory }) {
  return (
    <div className="pointer-events-none absolute left-0 top-full z-[80] mt-4 w-[min(28rem,calc(100vw-3rem))] origin-top rounded-[6px] border border-yellow-400/35 bg-[#061225]/95 p-4 text-left opacity-0 shadow-[0_22px_55px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 sm:-left-3 sm:w-[30rem] sm:translate-y-2 sm:scale-95">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200">
          Preview Excel {category.title}
        </p>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
          XLSX
        </span>
      </div>

      <div className="overflow-hidden rounded-[4px] border border-white/10">
        <div className="grid grid-cols-[2.5rem_1.3fr_0.8fr_1.2fr] bg-white/10 text-[10px] font-black uppercase tracking-[0.1em] text-slate-200">
          <span className="border-r border-white/10 px-2 py-2">No</span>
          <span className="border-r border-white/10 px-2 py-2">Nama</span>
          <span className="border-r border-white/10 px-2 py-2">Pangkat</span>
          <span className="px-2 py-2">Jabatan/Jawatan</span>
        </div>

        {category.rows.slice(0, 3).map((row) => (
          <div
            key={row.no}
            className="grid grid-cols-[2.5rem_1.3fr_0.8fr_1.2fr] border-t border-white/10 text-[11px] font-semibold leading-4 text-slate-100"
          >
            <span className="border-r border-white/10 px-2 py-2 text-slate-300">
              {row.no}
            </span>
            <span className="border-r border-white/10 px-2 py-2">
              {row.nama}
            </span>
            <span className="border-r border-white/10 px-2 py-2">
              {row.pangkat}
            </span>
            <span className="px-2 py-2">
              {row.jabatan}
              <span className="mt-1 block border-t border-white/10 pt-1 text-[10px] text-slate-300">
                {row.jawatan || "-"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonnelFieldPage() {
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
            href="/organization"
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
            <div className="relative z-10 min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Komando Sektor IV
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Bidang Personel
              </h2>
            </div>

            <div className="mt-10 grid w-full grid-cols-1 gap-10 sm:mt-12 sm:grid-cols-2 sm:gap-x-28 sm:gap-y-24">
              {personnelMenuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex min-h-20 w-full max-w-72 items-center justify-center rounded-[4px] border border-yellow-400/35 bg-[#061225]/95 px-5 py-4 text-center shadow-[0_14px_36px_rgba(0,0,0,0.38)] transition duration-300 hover:z-[70] hover:-translate-y-1 hover:border-yellow-300 hover:bg-[#0b1d3b] focus-visible:z-[70] sm:w-72",
                    index % 2 === 0 ? "sm:justify-self-start" : "sm:justify-self-end",
                  ].join(" ")}
                >
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-white transition group-hover:text-yellow-100">
                    {item.title}
                  </span>
                  <PersonnelPreview category={item.category} />
                </Link>
              ))}
            </div>

            <Link
              href="/organization/personel/permasalahan-upaya"
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

export default async function OrganizationFieldPage({
  params,
}: PageProps<"/organization/[slug]">) {
  const { slug } = await params;

  if (!(slug in organizationFields)) {
    notFound();
  }

  const field = organizationFields[slug as OrganizationFieldSlug];

  if (slug === "operasi") {
    return <FieldMenuPage title="Bidang Operasi" items={operationMenuItems} />;
  }

  if (slug === "intelijen") {
    return (
      <FieldMenuPage title="Bidang Intelijen" items={intelligenceMenuItems} />
    );
  }

  if (slug === "latihan") {
    return <FieldMenuPage title="Bidang Latihan" items={trainingMenuItems} />;
  }

  if (slug === "personel") {
    return <PersonnelFieldPage />;
  }

  if (slug === "logistik") {
    return <SplitGridFieldPage title="Bidang Logistik" items={logisticsMenuItems} />;
  }

  if (slug === "komlek") {
    return (
      <FieldMenuPage
        title="Bidang Komlek"
        items={communicationElectronicsMenuItems}
      />
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18]">
      <Image
        src="/images/background/all-background.jpeg"
        alt=""
        fill
        priority
        sizes="80vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#071225]/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/15 via-[#07152d]/35 to-[#030713]/70" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-3xl text-center">
          <Link
            href="/organization"
            className="mb-10 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali ke Organisasi
          </Link>

          <div className="rounded-2xl border border-white/25 bg-white/[0.16] px-6 py-12 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-yellow-200">
              Komando Sektor IV
            </p>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-[0.04em] text-white sm:text-5xl">
              {field.title}
            </h1>
            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <p className="mt-7 text-base leading-7 text-slate-200">
              {field.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
