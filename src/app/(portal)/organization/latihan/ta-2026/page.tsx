import Image from "next/image";
import Link from "next/link";

type TrainingItem = {
  title: string;
  details: string[];
};

const trainingItems: TrainingItem[] = [
  {
    title: "Lat Kilat D TA 2026",
    details: [
      "Dilaksanakan 3-4 Mar 2026 di Fasilitas Grup 3 Tempur, Lanud IWJ",
      "Mengirimkan pers GCI/FC ke Lanud IWJ:",
      "1. Mayor Lek Nanang Firman (Satrad 406)",
      "2. Lettu Lek Cheryl Silooy (Satrad 401)",
      "3. Mayor Lek Sudarman (Satrad 403)",
      "4. Letda Lek Akmalul (Satrad 404)",
    ],
  },
  {
    title: "Lat Profisiensi GCI/FC",
    details: [
      "Dilaksanakan di Satrad masing-masing",
      "Mengirimkan pers GCI/FC ke Lanud IWJ melaksanakan Lat Profisiensi Siklus I (Jan-April):",
      "1. Mayor Lek Nanang Firman (Satrad 406)",
      "2. Lettu Lek Cheryl Silooy (Satrad 401)",
    ],
  },
  {
    title: "Lat Menembak Sem 1 TA. 2026",
    details: [
      "Waktu pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: 21-22 Apr 2026",
      "Satrad 402: Renc Minggu 1 Juni 2026",
      "Satrad 403: Renc Minggu 3 Mei 2026",
      "Satrad 404: Renc Minggu 2 Mei 2026",
      "Satrad 405: 15 April 2026",
      "Satrad 406: Renc Minggu 2 Mei 2026",
      "Tempat pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: Lap Tembak Grup 1 Korpasgat",
      "Satrad 402: Lap Tembak Yon Armed 13/Kostrad",
      "Satrad 403: Lap Tembak Yonif 407/Tegal",
      "Satrad 404: Lap Tembak AAU",
      "Satrad 405: Lap Tembak Kodim 0814/Jombang",
      "Satrad 406: Lap Tembak Puslatpur TNI AL Purboyo",
    ],
  },
];

export default function Training2026Page() {
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
            href="/organization/latihan"
            className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10">
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Latihan
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                TA 2026
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {trainingItems.map((item, index) => (
                <article
                  key={item.title}
                  className={[
                    "overflow-hidden rounded-[6px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_18px_48px_rgba(0,0,0,0.36)]",
                    index === trainingItems.length - 1 ? "lg:col-span-2" : "",
                  ].join(" ")}
                >
                  <h3 className="border-b border-yellow-300/30 bg-[#071f4b] px-4 py-3 text-sm font-black uppercase tracking-[0.06em] text-yellow-100 shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                    {item.title}
                  </h3>
                  <ul className="space-y-1 px-5 py-4 text-sm font-bold leading-5 text-[#071a33]">
                    {item.details.map((detail) => (
                      <li key={`${item.title}-${detail}`}>
                        <span className="mr-1 text-[#0b2d66]">-</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
