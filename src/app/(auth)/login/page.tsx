import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <section className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-8 shadow-xl">
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
