import { notFound } from "next/navigation";

import { EditablePalposekCards } from "@/components/portal/organization/editable-palposek-cards";
import { UnitKomlekDetailShell } from "@/components/portal/units/unit-komlek-pages";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitPalposekReadinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const defaultRows: EditableTableDefaultRow[] = [
  {
    rowKey: "radio-gta",
    cells: {
      title: "Radio GTA",
      content: "",
    },
  },
  {
    rowKey: "genset",
    cells: {
      title: "Genset",
      content: "",
    },
  },
  {
    rowKey: "ups-avr",
    cells: {
      title: "UPS & AVR",
      content: "",
    },
  },
];

function tableKey(unitSlug: string) {
  return `unit:${unitSlug}:komlek:kesiapan-palposek`;
}

export default async function UnitPalposekReadinessPage({
  params,
}: UnitPalposekReadinessPageProps) {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const rows = await getEditableTableRows(tableKey(unit.slug), defaultRows);

  return (
    <UnitKomlekDetailShell
      unitName={unit.name}
      unitSlug={unit.slug}
      title="Kesiapan Palposek"
    >
      <EditablePalposekCards tableKey={tableKey(unit.slug)} rows={rows} />
    </UnitKomlekDetailShell>
  );
}