type OrderBatchDragOverlayCardProps = {
  selectedCount: number
  isLoading?: boolean
}

export const OrderBatchDragOverlayCard = ({
  selectedCount,
  isLoading = false,
}: OrderBatchDragOverlayCardProps) => (
  <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-lg">
    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
      Moving Orders
    </p>
    <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
      {isLoading ? 'Loading orders...' : `${selectedCount} selected order${selectedCount === 1 ? '' : 's'}`}
    </p>
  </div>
)
