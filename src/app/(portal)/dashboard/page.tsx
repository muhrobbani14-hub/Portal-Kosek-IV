import Image from "next/image";
import Link from "next/link";

import { getPortalMenus } from "@/server/queries/portal";

function getMenuHref(menu: {
  type: "ORGANIZATION" | "UNIT_GROUP";
  slug: string;
  units: Array<{
    slug: string;
  }>;
}) {
  if (menu.type === "ORGANIZATION") {
    return "/organization";
  }

  if (menu.units.length === 1) {
    return `/units/${menu.units[0].slug}`;
  }

  return `/units/group/${menu.slug}`;
}

function getUnitCode(title: string) {
  return title.match(/\b(401|402|403|421|404|405|406)\b/)?.[1];
}

function getUnitLogoScaleClass(title: string) {
  const unitCode = getUnitCode(title);

  const logoScaleByCode: Record<string, string> = {
    "401": "scale-100 group-hover:scale-105",
    "402": "scale-105 group-hover:scale-110",
    "403": "scale-[1.32] group-hover:scale-[1.38]",
    "404": "scale-[1.48] group-hover:scale-[1.55]",
    "405": "scale-[1.18] group-hover:scale-[1.24]",
    "406": "scale-[1.38] group-hover:scale-[1.45]",
  };

  return unitCode ? logoScaleByCode[unitCode] ?? "scale-100" : "scale-100";
}

export default async function DashboardPage() {
  const menus = await getPortalMenus();

  const organizationMenu = menus.find(
    (menu) => menu.type === "ORGANIZATION",
  );

  const unitMenus = menus.filter(
    (menu) => menu.type === "UNIT_GROUP",
  );

  const unitOrder: Record<string, number> = {
  "401": 1,
  "402": 2,
  "403": 3,
  "421": 4,
  "404": 5,
  "405": 6,
  "406": 7,
};

const sortedUnitMenus = [...unitMenus].sort((a, b) => {
  const codeA = getUnitCode(a.title);
  const codeB = getUnitCode(b.title);

  const orderA = codeA ? unitOrder[codeA] : 999;
  const orderB = codeB ? unitOrder[codeB] : 999;

  return orderA - orderB;
});
  
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Image
        src="/images/background/gedung kosek IV.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-blue-950/60" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-lg font-semibold uppercase tracking-[0.35em] text-amber-300">
            Komando Sektor IV
          </p>
        </div>

        {organizationMenu ? (
          <Link
            href={getMenuHref(organizationMenu)}
            className="group mb-12 flex flex-col items-center rounded-2xl border border-white/10 bg-black/20 px-8 py-6 shadow-2xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-300/40 hover:bg-black/35"
          >
            <div className="relative h-52 w-52 transition duration-300 group-hover:scale-105 md:h-60 md:w-60">
              {organizationMenu.logoUrl ? (
                <Image
                  src={organizationMenu.logoUrl}
                  alt={organizationMenu.title}
                  fill
                  priority
                  sizes="240px"
                  className="object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-4xl font-bold">
                  1
                </div>
              )}
            </div>

            <p className="mt-4 rounded-full border border-white/20 bg-black/30 px-6 py-2 text-base font-semibold text-white backdrop-blur-sm">
              {organizationMenu.title}
            </p>
          </Link>
        ) : null}

        <div className="grid w-full max-w-7xl grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-7">
          {sortedUnitMenus.map((menu) => (
            <Link
              key={menu.id}
              href={getMenuHref(menu)}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-black/35"
            >
              <div className="relative h-24 w-24 md:h-28 md:w-28">
                {menu.logoUrl ? (
                  <Image
                    src={menu.logoUrl}
                    alt={menu.title}
                    fill
                    sizes="112px"
                    className={[
                      "object-contain drop-shadow-xl transition duration-300",
                      getUnitLogoScaleClass(menu.title),
                    ].join(" ")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                    {menu.menuNumber}
                  </div>
                )}
              </div>

              <p className="mt-3 min-h-10 text-center text-sm font-semibold text-white">
                {menu.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
