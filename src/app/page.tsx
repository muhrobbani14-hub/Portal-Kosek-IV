export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
          Project Initialization
        </p>

        <h1 className="text-3xl font-bold">
          Portal Informasi Kesatuan
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Fondasi aplikasi berhasil dijalankan. Login, portal utama,
          struktur organisasi, unit, dan dashboard admin akan dibuat
          pada milestone berikutnya.
        </p>

        <div className="mt-8 rounded-xl bg-black/20 p-4 text-left text-sm">
          <p>
            Aplikasi:
            <span className="ml-2 font-semibold text-emerald-300">
              Berjalan
            </span>
          </p>

          <p className="mt-2">
            Database:
            <span className="ml-2">
              Periksa melalui
              <code className="ml-2 rounded bg-black/40 px-2 py-1">
                /api/health
              </code>
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}