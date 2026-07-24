import { notFound } from "next/navigation";

import { EditableDataTable } from "@/components/portal/organization/editable-data-table";
import { UnitKomlekDetailShell } from "@/components/portal/units/unit-komlek-pages";
import {
  getUnitKomlekRadioTableKey,
  unitKomlekRadioColumns,
  unitKomlekRadioDefaultRows,
} from "@/lib/komlek-radio-satrad";
import { getEditableTableRows } from "@/lib/portal-editable-tables";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitRadioReadinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UnitRadioReadinessPage({
  params,
}: UnitRadioReadinessPageProps) {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const tableKey = getUnitKomlekRadioTableKey(unit.slug);
  const rows = await getEditableTableRows(
    tableKey,
    unitKomlekRadioDefaultRows,
  );

  return (
    <UnitKomlekDetailShell
      unitName={unit.name}
      unitSlug={unit.slug}
      title="Kesiapan Radio Satrad"
    >
      <EditableDataTable
        tableKey={tableKey}
        columns={unitKomlekRadioColumns}
        rows={rows}
      />
    </UnitKomlekDetailShell>
  );
}