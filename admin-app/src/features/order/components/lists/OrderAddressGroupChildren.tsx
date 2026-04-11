import type { Order } from '../../types/order'
import { DraggableOrderCard } from '../cards/DraggableOrderCard'

type OrderAddressGroupChildrenProps = {
  orders: Order[]
  isSelectionMode: boolean
  isOrderSelected?: (order: Order) => boolean
  onToggleSelection?: (order: Order) => void
  onOpenOrder?: (order: Order) => void
  onArchive?: (order: Order) => void
  onUnarchive?: (order: Order) => void
  hoveredClientId?: string | null
  onOrderMouseEnter?: (order: Order) => void
  onOrderMouseLeave?: () => void
}

export const OrderAddressGroupChildren = ({
  orders,
  isSelectionMode,
  isOrderSelected,
  onToggleSelection,
  onOpenOrder,
  onArchive,
  onUnarchive,
  hoveredClientId,
  onOrderMouseEnter,
  onOrderMouseLeave,
}: OrderAddressGroupChildrenProps) => (
  <div className="relative ml-[39px]  mt-2 mb-4 ">
    {orders.length > 1 ? (
      <div className="pointer-events-none absolute  bottom-2 -left-[18px] -top-6 w-[1px] bg-[var(--color-primary)]/40" />
    ) : null}

    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <div key={order.client_id} className="relative">
          {orders.length > 1 ? (
            <div className="pointer-events-none absolute -left-[15px] top-8 h-px w-3 bg-[var(--color-primary)]/40" />
          ) : null}
          <DraggableOrderCard
            order={order}
            onOpen={isSelectionMode ? undefined : onOpenOrder}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            isHovered={hoveredClientId === order.client_id}
            onMouseEnter={onOrderMouseEnter}
            onMouseLeave={onOrderMouseLeave}
            isSelectionMode={isSelectionMode}
            isSelected={isOrderSelected?.(order) ?? false}
            onToggleSelection={onToggleSelection}
          />
        </div>
      ))}
    </div>
  </div>
)
