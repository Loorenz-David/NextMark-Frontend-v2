type OrderBatchDragOverlayCardProps = {
  selectedCount: number
  isLoading?: boolean
}

export const OrderBatchDragOverlayCard = ({
  selectedCount,
  isLoading = false,
}: OrderBatchDragOverlayCardProps) => (
  <div className="rounded-xl border border-border bg-[var(--glass-surface-weak)] px-4 py-3 text-text shadow-lg backdrop-blur-xl">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
      Moving Orders
    </p>
    <p className="mt-1 text-sm font-medium text-text">
      {isLoading ? 'Loading orders...' : `${selectedCount} selected order${selectedCount === 1 ? '' : 's'}`}
    </p>
  </div>
)
