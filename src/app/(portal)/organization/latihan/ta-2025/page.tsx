import Image from "next/image";
import Link from "next/link";

import { EditableTrainingCards } from "@/components/portal/organization/editable-training-cards";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";

type TrainingItem = {
  title: string;
  details: string[];
};

const trainingItems: TrainingItem[] = [
  {
    title: "Lat Kilat A TA. 2025",
    details: [
      "Waktu: 3-4 Februari 2025",
      "Pelaku: 4 GCI",
      "Engage: 15 engagement",
      "JT: 12 jam 50 menit",
    ],
  },
  {
    title: "Lat Petir TA. 2025",
    details: [
      "Waktu: 21-22 April 2025",
      "Pelaku: TS (F16 Skd 3), Satrudal 421",
      "JT: 14 jam 40 menit",
    ],
  },
  {
    title: "Lat Cakra A TA. 2025",
    details: [
      "Waktu: 28 April - 1 Mei 2025",
      "Pelaku: TS (F16 Skd 3), Bulsi (C130 Skd 31), Satrad 401, 402, Satrudal 421, Denhanud 471",
      "JT: F-16 17 jam 20 menit, C-130 8 jam 20 menit",
    ],
  },
  {
    title: "Lat Profisiensi GCI/FC",
    details: [
      "Dilaksanakan di Satrad masing-masing",
      "Mengirimkan pers GCI/FC ke Lanud IWJ melaksanakan Lat Profisiensi Siklus I (Jan-April): Lettu Lek Idris (Satrad 402)",
      "Siklus II (Mei-Agust): Letda Lek Akmalul (Satrad 404)",
      "Siklus III (Sept-Des): Mayor Lek Ilham Haffiz (Satrad 201)",
    ],
  },
  {
    title: "Lat Kesiagaan Damkar TA. 2025",
    details: ["Waktu: 15 April 2025", "Peserta: 170 Pers Kosek IV"],
  },
  {
    title: "Lat Menembak Sem 1 TA. 2025",
    details: [
      "Waktu pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: 16-17 April 2025",
      "Satrad 201: 21-22 Mei 2025",
      "Satrad 106: 18 Juni 2025",
      "Satrad 403: 8 Mei 2025",
      "Satrad 404: 12 Juni 2025",
      "Satrad 402: NIL (Lap Tembak Yon Armed 13 sedang renovasi), digabung Sem 2",
      "Tempat pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: Lap Tembak Grup 1 Korpasgat",
      "Satrad 201: Lap Tembak Lanud RSA",
      "Satrad 106: Lap Tembak Lanud RHF",
      "Satrad 403: Lap Tembak Lanud JBS",
      "Satrad 404: Lap Tembak AAU",
      "Satrad 402: Lap Tembak Yon Armed 13/Kostrad",
    ],
  },
  {
    title: "Lat Kesiagaan Gul Benc Alam TA. 2025",
    details: [
      "Waktu: 28 Oktober 2025",
      "Peserta: Seluruh personel Mako Kosek IV",
    ],
  },
  {
    title: "Lat Menembak Sem 2 TA. 2025",
    details: [
      "Waktu pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: 3-4 Nov 2025",
      "Satrad 201: 5-6 Nov 2025",
      "Satrad 106: 15-16 Okt 2025",
      "Satrad 403: 17 Des 2025",
      "Satrad 404: 19 Des 2025",
      "Satrad 402: 22 Des 2025",
      "Tempat pelaksanaan:",
      "Kosek IV, Satrad 401, Satrudal 421: Lap Tembak Grup 1 Korpasgat",
      "Satrad 201: Lap Tembak Lanud RSA",
      "Satrad 106: Lap Tembak Lanud RHF",
      "Satrad 403: Lap Tembak Lanud JBS",
      "Satrad 404: Lap Tembak Lanud AAU",
      "Satrad 402: Lap Tembak Yon Armed 13/Kostrad",
    ],
  },
];

const tableKey = "training-plans-ta-2025";

const defaultRows: EditableTableDefaultRow[] = trainingItems.map(
  (item, index) => ({
    rowKey: `training-2025-${index + 1}`,
    cells: {
      title: item.title,
      details: item.details.join("\n"),
    },
  }),
);

export default async function Training2025Page() {
  const rows = await getEditableTableRows(tableKey, defaultRows);

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
                TA 2025
              </h2>
            </div>

            <EditableTrainingCards tableKey={tableKey} rows={rows} />
          </div>
        </section>
      </div>
    </main>
  );
}
