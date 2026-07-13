import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth/session";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({
  children,
}: PortalLayoutProps) {
  const session = await requireUser();

  const userInitial =
    session.user.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#030817] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030817]/90 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        {/* Garis aksen emas */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />

        {/* Efek cahaya dekoratif */}
        <div className="pointer-events-none absolute -left-24 top-0 h-24 w-80 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 top-0 h-24 w-80 rounded-full bg-yellow-400/5 blur-3xl" />

        <div className="relative mx-auto flex min-h-20 w-full max-w-[1800px] items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-8">
          {/* Identitas portal */}
          <Link
            href="/dashboard"
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-yellow-400/30 bg-gradient-to-br from-[#173b73] via-[#0b2143] to-[#040b18] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition duration-300 group-hover:border-yellow-400/60">
              <Image
                src="/images/logos/logo-kosek IV.png"
                alt="Logo Kosek IV"
                width={447}
                height={447}
                priority
                sizes="48px"
                className="relative z-10 h-full w-full object-contain"
              />

              <div className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-black uppercase tracking-[0.08em] text-white sm:text-base">
                  MAKOSEK 
                </h1>

                <span className="hidden h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)] sm:block" />
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />

                <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Sistem Informasi Terintegrasi
                </p>
              </div>
            </div>
          </Link>

          {/* Area pengguna dan navigasi */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Informasi pengguna */}
            <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-inner sm:flex">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-xs font-black text-blue-200">
                {userInitial}
              </div>

              <div className="max-w-40">
                <p className="truncate text-xs font-bold text-white">
                  {session.user.name}
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Pengguna Portal
                </p>
              </div>
            </div>

            <div className="hidden h-7 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block" />

            {/* Komponen logout lama tetap digunakan */}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
