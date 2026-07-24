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
    return "/kosek-iv";
  }

  if (menu.units.length >= 1) {
    return `/satrad/${menu.units[0].slug}`;
  }

  return `/satrad/group/${menu.slug}`;
}

function getUnitCode(title: string) {
  return title.match(/\b(401|402|403|421|404|405|406|407)\b/)?.[1];
}

function getUnitLogoScaleClass(title: string) {
  const unitCode = getUnitCode(title);

  // Compensate for transparent padding inside each logo file so every unit
  // appears visually consistent and centered inside the same dashboard frame.
  const logoScaleByCode: Record<string, string> = {
    "401": "scale-[0.98] -translate-y-0.5 group-hover:scale-[1.03]",
    "402": "scale-[1.07] translate-y-0.5 group-hover:scale-[1.12]",
    "403": "scale-[1.33] translate-y-0.5 group-hover:scale-[1.38]",
    "421": "scale-[1.22] -translate-y-0.5 group-hover:scale-[1.27]",
    "404": "scale-[1.47] translate-y-2 group-hover:scale-[1.52]",
    "405": "scale-[1.2] -translate-y-0.5 group-hover:scale-[1.25]",
    "406": "scale-[1.4] translate-y-1 group-hover:scale-[1.45]",
    "407": "scale-[1.01] group-hover:scale-[1.06]",
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
    "407": 8,
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
        src="/images/background/dashboard.bg.png"
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

        <div className="grid w-full max-w-[92rem] grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-8">
          {sortedUnitMenus.map((menu) => (
            <Link
              key={menu.id}
              href={getMenuHref(menu)}
              className="group flex flex-col items-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-black/35"
            >
              <div className="relative h-24 w-24 overflow-visible md:h-28 md:w-28">
                {menu.logoUrl ? (
                  <Image
                    src={menu.logoUrl}
                    alt={menu.title}
                    fill
                    sizes="112px"
                    className={[
                      "origin-center object-contain drop-shadow-xl transition duration-300",
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
