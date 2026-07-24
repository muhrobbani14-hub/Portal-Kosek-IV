import { notFound } from "next/navigation";

import { EditableDataTable } from "@/components/portal/organization/editable-data-table";
import { UnitKomlekDetailShell } from "@/components/portal/units/unit-komlek-pages";
import {
  getEditableTableRows,
  type EditableTableColumn,
} from "@/lib/portal-editable-tables";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitKomlekProblemActionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const problemActionColumns: EditableTableColumn[] = [
  { key: "problem", label: "Permasalahan" },
  { key: "action", label: "Upaya" },
];

function tableKey(unitSlug: string) {
  return `unit:${unitSlug}:komlek:permasalahan-upaya`;
}

export default async function UnitKomlekProblemActionPage({
  params,
}: UnitKomlekProblemActionPageProps) {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const rows = await getEditableTableRows(tableKey(unit.slug), []);

  return (
    <UnitKomlekDetailShell
      unitName={unit.name}
      unitSlug={unit.slug}
      title="Permasalahan dan Upaya"
    >
      <EditableDataTable
        tableKey={tableKey(unit.slug)}
        columns={problemActionColumns}
        rows={rows}
      />
    </UnitKomlekDetailShell>
  );
}