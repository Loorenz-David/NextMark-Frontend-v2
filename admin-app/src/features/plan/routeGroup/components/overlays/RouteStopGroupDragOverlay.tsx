type RouteStopGroupDragOverlayProps = {
  count: number;
  label: string;
  firstStopOrder?: number | null;
  lastStopOrder?: number | null;
};

export const RouteStopGroupDragOverlay = ({
  count,
  label,
  firstStopOrder,
  lastStopOrder,
}: RouteStopGroupDragOverlayProps) => (
  <div className="rounded-xl border border-white/10 admin-glass-panel admin-surface-compact px-4 py-3 ">
    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
      Moving Stop Group
    </p>
    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
      {count} orders
    </p>
    <p className="text-xs text-[var(--color-muted)]">
      Stops {firstStopOrder ?? "--"} - {lastStopOrder ?? "--"}
    </p>
    <p className="mt-1 max-w-[240px] truncate text-xs text-[var(--color-muted)]">
      {label}
    </p>
  </div>
);
