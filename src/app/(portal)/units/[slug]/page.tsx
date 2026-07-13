import Link from "next/link";
import { notFound } from "next/navigation";

import UnitDetailCard from "@/components/portal/units/unit-detail-card";
import UnitMaintenanceSection from "@/components/portal/units/unit-maintenance-section";
import { getUnitBySlug } from "@/server/queries/portal";

type UnitDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UnitDetailPage({
  params,
}: UnitDetailPageProps) {
  const { slug } = await params;

  const unit = await getUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  const maintenanceProblems = unit.problems.map((problem) => ({
    ...problem,
    occurredAt: problem.occurredAt
      ? problem.occurredAt.toISOString().slice(0, 10)
      : null,
    actions: problem.actions.map((action) => ({
      ...action,
      actionDate: action.actionDate.toISOString().slice(0, 10),
    })),
  }));

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-100 px-5 py-10 text-slate-950 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Kembali ke dashboard
        </Link>

        <UnitDetailCard unit={unit} />

        <UnitMaintenanceSection
          unitId={unit.id}
          problems={maintenanceProblems}
        />
      </div>
    </section>
  );
}
