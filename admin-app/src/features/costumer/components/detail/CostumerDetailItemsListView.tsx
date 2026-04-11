import { ItemCard } from '@/features/order'
import type { Order } from '@/features/order/types/order'
import type { Item } from '@/features/order/item/types'

export const CostumerDetailItemsListView = ({
  items,
  orderById,
  onOpenOrderByItem,
}: {
  items: Item[]
  orderById: Map<number, Order>
  onOpenOrderByItem: (item: Item) => void
}) => {
  if (!items.length) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-[var(--color-muted)]">
        No items found in this costumer orders.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin px-4 pb-5 pt-3">
      {items.map((item) => {
        const fallbackKey = `${item.client_id}-${item.order_id}`
        const parentOrder = orderById.get(item.order_id)
        return (
          <div key={fallbackKey} className="cursor-pointer" onClick={() => onOpenOrderByItem(item)}>
            <ItemCard
              item={item}
              showDelete={false}
              isExpanded={false}
              onToggleExpand={() => {
                if (parentOrder) {
                  onOpenOrderByItem(item)
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

