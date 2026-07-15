import Image from "next/image";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <Image
        src="/images/background/landing-page.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#030916]/75" />

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md">
        <Image
          src="/images/logos/logo-kosek IV.png"
          alt="Logo Kosek IV"
          width={104}
          height={104}
          className="mx-auto mb-5 h-24 w-24 object-contain"
          priority
        />
        <h1 className="text-center text-2xl font-bold text-white">
          Portal Informasi Kesatuan
        </h1>
        <p className="mt-2 text-center text-slate-300">
          Silakan login untuk melanjutkan.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
