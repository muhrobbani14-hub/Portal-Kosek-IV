import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditableDataTable } from "@/components/portal/organization/editable-data-table";
import { UnitKomlekMenu } from "@/components/portal/units/unit-komlek-pages";
import { UnitOrganizationChart } from "@/components/portal/units/unit-organization-chart";
import { UnitPersonnelMenu } from "@/components/portal/units/unit-personnel-menu";
import {
  getEditableTableRows,
  type EditableTableColumn,
} from "@/lib/portal-editable-tables";
import { UNIT_ORGANIZATION_STRUCTURE } from "@/lib/unit-organization-structure";
import { personnelCategories } from "@/lib/personnel-data";
import { getUnitPersonnelOptions } from "@/lib/personnel-options";
import { getUnitPersonnelDefaultRows } from "@/lib/unit-personnel-data";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitSectionPageProps = {
  params: Promise<{
    slug: string;
    section: string;
  }>;
};

type UnitSection = {
  slug: string;
  title: string;
  description: string;
};

const unitSections: UnitSection[] = [
  {
    slug: "struktur-organisasi",
    title: "Struktur Organisasi",
    description: "Informasi Struktur Organisasi dan Personel",
  },
  {
    slug: "operasi",
    title: "Operasi",
    description: "Informasi operasi satuan",
  },
  {
    slug: "latihan",
    title: "Latihan",
    description: "Informasi latihan satuan",
  },
  {
    slug: "intelijen",
    title: "Intelijen",
    description: "Informasi intelijen satuan",
  },
  {
    slug: "personel",
    title: "Personel",
    description: "Informasi personel satuan",
  },
  {
    slug: "komlek",
    title: "Komlek",
    description: "Informasi komlek satuan",
  },
  {
    slug: "logistik",
    title: "Logistik",
    description: "Informasi logistik satuan",
  },
];

const unitSectionColumns: EditableTableColumn[] = [
  {
    key: "title",
    label: "Judul",
  },
  {
    key: "description",
    label: "Keterangan",
  },
  {
    key: "note",
    label: "Catatan",
  },
];

function getUnitSection(slug: string) {
  return unitSections.find((section) => section.slug === slug);
}

function getUnitOrganizationDefaultRows() {
  return UNIT_ORGANIZATION_STRUCTURE.map((node) => ({
    rowKey: node.key,
    cells: {
      title: node.title,
      name: "",
      rank: "",
      nrp: "",
      birthPlace: "",
      birthDate: "",
      education: "",
      careerHistory: "",
      photoUrl: "",
    },
  }));
}

function getTableKey(unitSlug: string, sectionSlug: string) {
  return `unit:${unitSlug}:${sectionSlug}`;
}

function getUnitPersonnelTableKey(unitSlug: string, categorySlug: string) {
  return `unit:${unitSlug}:personel:${categorySlug}`;
}

export default async function UnitSectionPage({
  params,
}: UnitSectionPageProps) {
  const { slug, section: sectionSlug } = await params;
  const unit = await getUnitBySlug(slug);
  const section = getUnitSection(sectionSlug);

  if (!unit || !section) {
    notFound();
  }
  if (section.slug === "komlek") {
    return <UnitKomlekMenu unitName={unit.name} unitSlug={unit.slug} />;
  }

  if (section.slug === "personel") {
    const previews = await Promise.all(
      personnelCategories.map(async (category) => ({
        category,
        rows: await getEditableTableRows(
          getUnitPersonnelTableKey(unit.slug, category.slug),
          getUnitPersonnelDefaultRows(unit.slug, category.slug),
        ),
      })),
    );

    return (
      <UnitPersonnelMenu
        unitName={unit.name}
        unitSlug={unit.slug}
        previews={previews}
      />
    );
  }

  const tableKey = getTableKey(unit.slug, section.slug);
  const defaultRows = section.slug === "struktur-organisasi"
    ? getUnitOrganizationDefaultRows()
    : [];
  const [rows, personnelOptions] = await Promise.all([
    getEditableTableRows(tableKey, defaultRows),
    section.slug === "struktur-organisasi"
      ? getUnitPersonnelOptions(unit.slug)
      : Promise.resolve([]),
  ]);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050b18] text-white">
      <Image
        src="/images/background/all-background.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[#071225]/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061126]/20 via-[#07152d]/45 to-[#030713]/80" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href={`/satrad/${unit.slug}`}
          className="group mb-8 inline-flex w-fit items-center gap-3 rounded-[6px] border border-white/10 bg-[#09162c]/75 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:bg-[#0c1c38] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-white/10 bg-white/5 text-lg transition group-hover:border-yellow-400/30 group-hover:text-yellow-300">
            &lt;
          </span>
          Kembali ke {unit.name}
        </Link>

        <section className="relative overflow-hidden rounded-[6px] border border-white/10 bg-[#07162d]/35 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-[2px] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-yellow-100">
                {unit.name}
              </p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.1em] text-white drop-shadow sm:text-4xl">
                {section.title}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-200/90">
                {section.description}
              </p>
              <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            </div>

            {section.slug === "struktur-organisasi" ? (
              <UnitOrganizationChart
                tableKey={tableKey}
                rows={rows}
                unitName={unit.name}
                personnelOptions={personnelOptions}
              />
            ) : (
              <EditableDataTable
                tableKey={tableKey}
                columns={unitSectionColumns}
                rows={rows}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}