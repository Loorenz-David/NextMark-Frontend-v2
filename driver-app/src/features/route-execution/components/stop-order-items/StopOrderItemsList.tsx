import type { AssignedStopOrderItemViewModel } from '@/app/contracts/routeExecution.types'
import { OrderItemCard } from './OrderItemCard'

type StopOrderItemsListProps = {
  items: AssignedStopOrderItemViewModel[]
  expandedItemClientId: string | null
  onToggleItem: (clientId: string) => void
}

export function StopOrderItemsList({
  items,
  expandedItemClientId,
  onToggleItem,
}: StopOrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.04] px-4 py-6 text-sm text-white/60">
        No items on this order.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pr-1">
      {items.map((item) => (
        <OrderItemCard
          key={item.clientId}
          item={item}
          isExpanded={expandedItemClientId === item.clientId}
          onToggle={() => onToggleItem(item.clientId)}
        />
      ))}
    </div>
  )
}
