import Image from "next/image";
import Link from "next/link";

import OrganizationChart from "@/components/portal/organization/organization-chart";
import { prisma } from "@/lib/prisma";

function formatBirthPlaceDate(
  birthPlace: string | null,
  birthDate: Date | null,
) {
  const date = birthDate
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(birthDate)
    : null;

  return [birthPlace, date].filter(Boolean).join(", ") || null;
}

export default async function OrganizationPage() {
  const positions = await prisma.organizationPosition.findMany({
    orderBy: [
      { level: "asc" },
      { displayOrder: "asc" },
      { title: "asc" },
    ],
    select: {
      id: true,
      key: true,
      title: true,
      section: true,
      parentId: true,
      level: true,
      displayOrder: true,
      isVisible: true,
      member: {
        select: {
          fullName: true,
          rank: true,
          serviceNumber: true,
          birthPlace: true,
          birthDate: true,
          education: true,
          description: true,
          photoUrl: true,
        },
      },
    },
  });

  const portalPositions = positions.map((position) => ({
    id: position.id,
    key: position.key,
    title: position.title,
    section: position.section,
    parentKey: position.parentId,
    level: position.level,
    displayOrder: position.displayOrder,
    subtitle: position.member?.rank ?? null,
    name: position.member?.fullName ?? null,
    rank: position.member?.rank ?? null,
    nrp: position.member?.serviceNumber ?? null,
    birthPlace: position.member?.birthPlace ?? null,
    birthDate: position.member?.birthDate
      ? position.member.birthDate.toISOString().slice(0, 10)
      : null,
    birthPlaceDate: position.member
      ? formatBirthPlaceDate(position.member.birthPlace, position.member.birthDate)
      : null,
    education: position.member?.education ?? null,
    careerHistory: position.member?.description ?? null,
    photoUrl: position.member?.photoUrl ?? null,
    isVisible: position.isVisible,
  }));

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#050b18]">
      <Image
        src="/images/background/all-background.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Overlay utama */}
      <div className="absolute inset-0 bg-[#071225]/35" />

      {/* Gradasi dramatis */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/15 via-[#07152d]/35 to-[#030713]/70" />

      {/* Cahaya biru halus */}
      <div className="absolute left-1/2 top-0 h-[440px] w-[900px] -translate-x-1/2 rounded-full bg-blue-700/15 blur-[130px]" />

      {/* Pola grid tipis */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1700px]">
          <Link
            href="/dashboard"
            className="group mb-7 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/85 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:bg-[#0c1c38] hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg transition group-hover:border-yellow-400/30 group-hover:text-yellow-300">
              ←
            </span>

            Kembali ke Dashboard
          </Link>

          <OrganizationChart positions={portalPositions} />
        </div>
      </div>
    </main>
  );
}
