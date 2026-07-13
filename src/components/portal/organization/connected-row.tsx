import type { OrganizationPosition } from "@/lib/organization-structure";
import PositionCard from "./position-card";

type ConnectedRowProps = {
  positions: OrganizationPosition[];
  compact?: boolean;
};

export default function ConnectedRow({
  positions,
  compact = false,
}: ConnectedRowProps) {
  if (!positions.length) {
    return null;
  }

  const hasMultipleItems = positions.length > 1;

  return (
    <div className="relative pt-6">
      {hasMultipleItems ? (
        <div className="absolute left-[5%] right-[5%] top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.25)]" />
      ) : null}

      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: `repeat(${positions.length}, minmax(0, 1fr))`,
        }}
      >
        {positions.map((position) => (
          <div key={position.key} className="relative flex justify-center pt-5">
            <div className="absolute top-0 h-5 w-0.5 bg-gradient-to-b from-amber-500 to-amber-600" />
            <PositionCard position={position} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}
