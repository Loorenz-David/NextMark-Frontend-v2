type OrderGroupDragOverlayCardProps = {
  count: number
  label: string
}

export const OrderGroupDragOverlayCard = ({ count, label }: OrderGroupDragOverlayCardProps) => (
  <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-lg">
    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Moving Group</p>
    <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{count} orders</p>
    <p className="mt-1 max-w-[240px] truncate text-xs text-[var(--color-muted)]">{label}</p>
  </div>
)
