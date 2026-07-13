import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getUnitGroupByMenuSlug } from "@/server/queries/portal";

type UnitGroupPageProps = {
  params: Promise<{
    menuSlug: string;
  }>;
};

export default async function UnitGroupPage({
  params,
}: UnitGroupPageProps) {
  const { menuSlug } = await params;

  const menu = await getUnitGroupByMenuSlug(menuSlug);

  if (!menu) {
    notFound();
  }

  if (menu.units.length === 1) {
    redirect(`/units/${menu.units[0].slug}`);
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-100 px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Kembali ke dashboard
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
            Pilihan Unit
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {menu.title}
          </h1>

          <p className="mt-3 text-slate-600">
            Pilih unit yang ingin ditampilkan.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {menu.units.map((unit) => (
            <Link
              key={unit.id}
              href={`/units/${unit.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-64 bg-slate-200">
                {unit.imageUrl ? (
                  <Image
                    src={unit.imageUrl}
                    alt={unit.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
                    Foto perangkat belum ditambahkan
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                  {unit.code}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {unit.name}
                </h2>

                <p className="mt-2 text-slate-600">
                  {unit.equipmentName ??
                    "Informasi perangkat belum tersedia"}
                </p>

                <p className="mt-5 font-semibold text-blue-700">
                  Lihat detail →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}