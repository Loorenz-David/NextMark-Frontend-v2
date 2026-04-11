import { DraggableOrderCard } from '@/features/order'
import type { Order } from '@/features/order/types/order'

export const CostumerDetailOrdersListView = ({
  orders,
  onOpenOrder,
}: {
  orders: Order[]
  onOpenOrder: (order: Order) => void
}) => {
  if (!orders.length) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-[var(--color-muted)]">
        No active orders found for this costumer.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-thin px-4 pb-5 pt-3">
      {orders.map((order) => (
        <DraggableOrderCard
          key={order.client_id}
          order={order}
          onOpen={onOpenOrder}
        />
      ))}
    </div>
  )
}

