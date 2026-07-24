import { notFound } from "next/navigation";

import { RadarReadinessCards } from "@/components/portal/organization/radar-readiness-cards";
import { UnitKomlekDetailShell } from "@/components/portal/units/unit-komlek-pages";
import {
  getEditableTableRows,
  type EditableTableDefaultRow,
} from "@/lib/portal-editable-tables";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitRadarReadinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const radarStatusDefaults: EditableTableDefaultRow[] = [
  { rowKey: "psr", cells: { component: "PSR", status: "Baik" } },
  { rowKey: "antenna", cells: { component: "Antenna", status: "Baik" } },
  { rowKey: "transmitter-system", cells: { component: "Transmitter system", status: "Baik" } },
  { rowKey: "receiver-system", cells: { component: "Receiver system", status: "Baik" } },
  { rowKey: "tccp-system", cells: { component: "TCCP system", status: "Baik" } },
  { rowKey: "ssr", cells: { component: "SSR", status: "Baik" } },
  { rowKey: "console-display", cells: { component: "Console Display", status: "Baik" } },
  { rowKey: "skykeeper", cells: { component: "Skykeeper", status: "Baik" } },
  { rowKey: "tdas", cells: { component: "TDAS", status: "Baik" } },
  { rowKey: "airnet", cells: { component: "Airnet", status: "Baik" } },
  { rowKey: "sbm-k3i", cells: { component: "SBM K3I", status: "Baik" } },
  { rowKey: "vsat-airnet", cells: { component: "VSAT Airnet", status: "Baik" } },
  { rowKey: "stl", cells: { component: "STL", status: "Baik" } },
  { rowKey: "ancillaries", cells: { component: "Ancillaries", status: "Baik" } },
];

function radarStatusTableKey(slug: string) {
  return `komlek-kesiapan-radar:${slug}`;
}

export default async function UnitRadarReadinessPage({
  params,
}: UnitRadarReadinessPageProps) {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const radarStatusRows = await getEditableTableRows(
    radarStatusTableKey(unit.slug),
    radarStatusDefaults,
  );

  return (
    <UnitKomlekDetailShell
      unitName={unit.name}
      unitSlug={unit.slug}
      title="Kesiapan Radar"
    >
      <RadarReadinessCards
        units={[
          {
            id: unit.id,
            code: unit.code,
            slug: unit.slug,
            name: unit.name,
            equipmentName: unit.equipmentName,
            description: unit.description,
            imageUrl: unit.imageUrl?.startsWith("data:") ? unit.imageUrl : null,
            radarStatusRows,
          },
        ]}
      />
    </UnitKomlekDetailShell>
  );
}