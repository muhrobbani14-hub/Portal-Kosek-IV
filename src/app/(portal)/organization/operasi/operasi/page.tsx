import Image from "next/image";
import Link from "next/link";

type OperationPlanItem = {
  title: string;
  details: {
    label: string;
    value: string;
  }[];
};

type OperationPlanGroup = {
  title: string;
  items: OperationPlanItem[];
};

const operationPlanGroups: OperationPlanGroup[] = [
  {
    title: "TA 2025",
    items: [
      {
        title: 'OPS HANUD "TANGKIS SAKTI - 25"',
        details: [
          { label: "Waktu", value: "365 hari" },
          {
            label: "Unsur",
            value:
              "Kosek IV, Satrad 401, 201, 106, 403, 404, 402, Satrudal 421, MCC CGK & RHF",
          },
          { label: "Jumlah", value: "132 pers" },
        ],
      },
      {
        title: 'OPS HANUD PASIF DI WIL TAS "SARANG SAKTI - 25"',
        details: [
          { label: "Waktu", value: "300 hari" },
          { label: "Unsur", value: "Kosek IV, Satrad 201, 106, 402" },
          { label: "Jumlah", value: "25 pers" },
        ],
      },
      {
        title: 'OPS PATKOR MALINDO DI WIL TAS "SAKTI MALINDO - 25"',
        details: [
          { label: "Waktu", value: "300 hari" },
          { label: "Unsur", value: "Kosek IV, Satrad 201, 106" },
          { label: "Jumlah", value: "40 pers" },
        ],
      },
      {
        title: 'OPS PAM OBVIT TNI "TANGKAL SAKTI - 25"',
        details: [
          { label: "Waktu", value: "365 hari" },
          {
            label: "Unsur",
            value:
              "Kosek IV, Satrad 401, 201, 106, 403, 404, 402, Satrudal 421, BKO Pasgat",
          },
          { label: "Jumlah", value: "116 pers" },
        ],
      },
      {
        title: 'OPS PAM VVIP "KENCANA SAKTI - 25"',
        details: [
          { label: "Waktu", value: "365 hari" },
          {
            label: "Unsur",
            value:
              "Kosek IV, Satrad 401, 201, 106, 403, 404, 402, Satrudal 421, MCC CGK & RHF",
          },
          { label: "Jumlah", value: "Menyesuaikan giat VVIP" },
        ],
      },
    ],
  },
  {
    title: "TW 1 TA 2026",
    items: [
      {
        title: '1. OPS HANUD AKTIF "VIRA RAKSA - 26"',
        details: [
          { label: "Waktu", value: "365 hari" },
          {
            label: "Unsur",
            value:
              "Kosek IV, Satrad 401, 402, 403, 404, 405, 406, Satrudal 421, MCC CGK",
          },
          { label: "Jumlah", value: "196 pers" },
        ],
      },
      {
        title: '2. OPS PAM OBVIT TNI "BENTENG SAKTI - 26"',
        details: [
          { label: "Waktu", value: "365 hari" },
          {
            label: "Unsur",
            value:
              "Kosek IV, BKO Korpasgat (Satrad 401, 402, 403, 404, 405, 406, Satrudal 421)",
          },
          { label: "Jumlah", value: "75 pers" },
        ],
      },
      {
        title: '3. OPS HANUD PASIF "SARANG SAKTI - 26"',
        details: [
          { label: "Waktu", value: "300 hari" },
          { label: "Unsur", value: "Kosek IV" },
          { label: "Jumlah", value: "18 pers" },
        ],
      },
    ],
  },
];

export default function OperationPlansPage() {
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
            href="/organization/operasi"
            className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-[#09162c]/80 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-yellow-400/40 hover:text-white"
          >
            <span className="text-lg">&lt;</span>
            Kembali
          </Link>
        </div>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/25 px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:px-8">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_36%)]" />

          <div className="relative z-10 w-full max-w-6xl">
            <div className="mx-auto mb-8 w-fit min-w-[260px] rounded-[6px] border border-white/25 bg-white/35 px-8 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md sm:min-w-[360px]">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-100">
                Bidang Operasi
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow sm:text-3xl">
                Operasi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {operationPlanGroups.map((group) => (
                <article
                  key={group.title}
                  className="rounded-[6px] border border-yellow-400/30 bg-[#061225]/88 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5"
                >
                  <h3 className="rounded-[4px] border border-yellow-300/40 bg-[#0b2d66] px-4 py-3 text-center text-base font-black uppercase tracking-[0.08em] text-yellow-100 shadow-[0_10px_28px_rgba(0,0,0,0.25)] sm:text-lg">
                    {group.title}
                  </h3>

                  <div className="mt-4 space-y-4">
                    {group.items.map((item) => (
                      <section
                        key={item.title}
                        className="overflow-hidden rounded-[4px] border border-yellow-400/25 bg-[#eaf1fb] shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
                      >
                        <h4 className="border-b border-yellow-300/30 bg-[#071f4b] px-4 py-2 text-sm font-black uppercase leading-5 tracking-[0.04em] text-yellow-100 sm:text-base">
                          {item.title}
                        </h4>

                        <ul className="space-y-1 px-5 py-3 text-sm font-bold leading-5 text-[#071a33]">
                          {item.details.map((detail) => (
                            <li key={`${item.title}-${detail.label}`}>
                              <span className="mr-1 text-[#0b2d66]">-</span>
                              <span>{detail.label} : </span>
                              <span className="font-black text-[#061225]">
                                {detail.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
