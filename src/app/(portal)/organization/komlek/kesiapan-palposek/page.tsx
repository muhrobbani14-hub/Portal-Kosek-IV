import Image from "next/image";
import Link from "next/link";

type PalposekReadinessGroup = {
  title: string;
  items?: string[];
  sections?: {
    label: string;
    amount: string;
    items: string[];
  }[];
};

const palposekReadinessGroups: PalposekReadinessGroup[] = [
  {
    title: "Radio GTA",
    sections: [
      {
        label: "UHF",
        amount: "2 unit",
        items: ["Telerad 100 W, 2S"],
      },
      {
        label: "VHF",
        amount: "3 unit",
        items: ["ICOM IC-A110 10 W, 1S", "Telerad 100 W, 2S"],
      },
      {
        label: "HF",
        amount: "2 unit",
        items: ["Vertex Standart 600 100 W, 1S", "Barret BC 2050 100 W, 1S"],
      },
    ],
  },
  {
    title: "Genset",
    items: [
      "Hargen 350 KVA kondisi S",
      "Mercedez Bens 350 KVA kondisi US",
      "Deutz 250 KVA kondisi S",
      "Denyo 25 KVA kondisi S",
    ],
  },
  {
    title: "UPS & AVR",
    items: [
      "UPS 160 KVA merk Piller kondisi S",
      "UPS 30 KVA merk Riello kondisi S",
      "UPS 15 KVA merk Piller kondisi US",
      "AVR merk Matsuyama kondisi 1 S / 1 US",
    ],
  },
];

export default function PalposekReadinessPage() {
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
            href="/organization/komlek"
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
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[420px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Komlek
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Kesiapan Palposek
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {palposekReadinessGroups.map((group) => (
                <article
                  key={group.title}
                  className="overflow-hidden rounded-[8px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_20px_55px_rgba(0,0,0,0.32)]"
                >
                  <h3 className="border-b border-yellow-300/30 bg-[#071f4b] px-5 py-4 text-center text-2xl font-black uppercase tracking-[0.04em] text-yellow-100 shadow-[0_8px_18px_rgba(0,0,0,0.18)] sm:text-3xl">
                    {group.title}
                  </h3>

                  {group.sections ? (
                    <div className="space-y-5 px-5 py-5 text-sm font-black uppercase leading-5 text-[#071a33] sm:text-base">
                      {group.sections.map((section) => (
                        <section key={`${group.title}-${section.label}`}>
                          <div className="grid grid-cols-[3.5rem_1rem_1fr] items-baseline gap-2 text-[#0b2d66]">
                            <span>{section.label}</span>
                            <span>:</span>
                            <span>{section.amount}</span>
                          </div>

                          <ul className="mt-2 space-y-2 pl-5">
                            {section.items.map((item, itemIndex) => (
                              <li
                                key={`${group.title}-${section.label}-${itemIndex}-${item}`}
                                className="grid grid-cols-[1rem_1fr] gap-2"
                              >
                                <span>-</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3 px-5 py-5 text-sm font-black uppercase leading-5 text-[#071a33] sm:text-base">
                      {group.items?.map((item, itemIndex) => (
                        <li
                          key={`${group.title}-${itemIndex}-${item}`}
                          className="flex gap-3"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b2d66] shadow-[0_0_0_3px_rgba(250,204,21,0.18)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
