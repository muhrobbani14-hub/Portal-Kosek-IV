import type { ReactNode } from "react";
import {
  DEFAULT_ORGANIZATION_STRUCTURE,
  type OrganizationPosition,
} from "@/lib/organization-structure";
import ConnectedRow from "./connected-row";
import PositionCard from "./position-card";

type SectionTitleProps = {
  children: ReactNode;
};

type OrganizationChartProps = {
  positions?: OrganizationPosition[];
};

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-yellow-300 to-amber-600" />
      <h2 className="shrink-0 text-sm font-extrabold uppercase tracking-[0.16em] text-[#0a1a36]">
        {children}
      </h2>
      <div className="h-px w-full bg-gradient-to-r from-amber-500/70 via-slate-300 to-transparent" />
    </div>
  );
}

function buildPositionMap(positions: OrganizationPosition[]) {
  return new Map(positions.map((item) => [item.key, item]));
}

function getDefaultNode(key: string): OrganizationPosition {
  const node = DEFAULT_ORGANIZATION_STRUCTURE.find((item) => item.key === key);

  if (!node) {
    throw new Error(`Organization node not found: ${key}`);
  }

  return node;
}

function resolveNode(
  key: string,
  positionMap: Map<string, OrganizationPosition>,
): OrganizationPosition {
  return positionMap.get(key) ?? getDefaultNode(key);
}

function resolveNodes(
  keys: string[],
  positionMap: Map<string, OrganizationPosition>,
): OrganizationPosition[] {
  return keys.map((key) => resolveNode(key, positionMap));
}

function getChildrenByParentKey(
  positions: OrganizationPosition[],
  parentKey: string,
) {
  return positions
    .filter((position) => position.parentKey === parentKey)
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }

      return a.title.localeCompare(b.title);
    });
}

export default function OrganizationChart({
  positions = [],
}: OrganizationChartProps) {
  const visiblePositions = positions.filter(
    (position) => position.isVisible !== false,
  );

  const positionMap = buildPositionMap(visiblePositions);

  const organizationStructure = {
    commander: resolveNode("KOMANDAN", positionMap),

    assistantStaff: resolveNodes(
      ["ASINTEL", "ASOPS", "ASPERS", "ASLOG", "ASKOMLEK"],
      positionMap,
    ),

    serviceStaffFirstRow: resolveNodes(
      ["KAKUM", "KAKU", "DANSATPROV", "KAKES", "KAPENTAK"],
      positionMap,
    ),

    serviceStaffSecondRow: resolveNodes(
      [
        "KAPOSEK",
        "KAPROGAR",
        "KASET",
        "KALAMBANGJA",
        "KOMANDAN_FLIGHTMA",
        "KAGUDKAI",
        "KOMANDAN_SATKOMLEK",
        "KAADA",
      ],
      positionMap,
    ),

    executorFirstRow: resolveNodes(
      [
        "SATRAD_211",
        "SATRAD_212",
        "SATRAD_213",
        "SATRAD_214",
        "SATRAD_215",
        "SATRAD_216",
        "SATRUDAL_111",
      ],
      positionMap,
    ),

    executorCurrentRow: resolveNodes(
      [
        "SATRAD_401",
        "SATRAD_402",
        "SATRAD_403",
        "SATRUDAL_421",
        "SATRAD_404",
        "SATRAD_405",
        "SATRAD_406",
      ],
      positionMap,
    ),
  };

  const standardKeys = new Set(
    DEFAULT_ORGANIZATION_STRUCTURE.map((item) => item.key),
  );

  const additionalPositions = visiblePositions
    .filter((position) => !standardKeys.has(position.key))
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }

      return a.title.localeCompare(b.title);
    });

  const commanderChildren = getChildrenByParentKey(
    additionalPositions,
    organizationStructure.commander.id ?? organizationStructure.commander.key,
  );

  const remainingAdditionalPositions = additionalPositions.filter(
    (position) => !commanderChildren.includes(position),
  );

  return (
    <section className="w-full">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-5 py-2 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-yellow-200">
            Struktur Instansi
          </p>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-white drop-shadow-lg md:text-5xl">
          Struktur Organisasi
        </h1>

        <p className="mt-2 text-base font-semibold uppercase tracking-[0.18em] text-blue-200">
          KOSEK IV
        </p>

        <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-300">
          Struktur komando, staf pembantu pimpinan, staf pelayanan, dan unsur
          pelaksana dalam lingkungan KOSEK IV.
        </p>
      </div>

      <div className="overflow-x-auto pb-10">
        <div className="relative mx-auto min-w-[1500px] overflow-hidden rounded-[28px] border border-white/25 bg-white/[0.42] p-10 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#0a1d3e] via-yellow-500 to-[#0a1d3e]" />
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-blue-900/10 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 bg-gradient-to-tl from-yellow-500/10 to-transparent" />

          <div className="relative z-10">
            <SectionTitle>Pimpinan</SectionTitle>
            <div className="flex justify-center">
              <PositionCard position={organizationStructure.commander} emphasis />
            </div>

            {commanderChildren.length > 0 ? (
              <>
                <div className="mx-auto h-10 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600" />
                <ConnectedRow positions={commanderChildren} compact />
              </>
            ) : null}

            <div className="mx-auto h-12 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600" />

            <SectionTitle>Staf Pembantu Pimpinan</SectionTitle>
            <ConnectedRow positions={organizationStructure.assistantStaff} />

            <div className="mx-auto h-16 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600" />

            <SectionTitle>Staf Pelayanan</SectionTitle>
            <ConnectedRow positions={organizationStructure.serviceStaffFirstRow} />

            <div className="mx-auto h-14 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600" />

            <ConnectedRow
              positions={organizationStructure.serviceStaffSecondRow}
              compact
            />

            <div className="mx-auto h-16 w-0.5 bg-gradient-to-b from-amber-400 to-amber-600" />

            <SectionTitle>Pelaksana</SectionTitle>
            <ConnectedRow positions={organizationStructure.executorFirstRow} compact />

            <div className="my-12 h-1 w-full bg-gradient-to-r from-transparent via-blue-700 to-transparent" />

            <ConnectedRow positions={organizationStructure.executorCurrentRow} compact />

            {remainingAdditionalPositions.length > 0 ? (
              <>
                <div className="my-12 h-1 w-full bg-gradient-to-r from-transparent via-blue-700 to-transparent" />
                <SectionTitle>Posisi Tambahan</SectionTitle>
                <ConnectedRow positions={remainingAdditionalPositions} compact />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
