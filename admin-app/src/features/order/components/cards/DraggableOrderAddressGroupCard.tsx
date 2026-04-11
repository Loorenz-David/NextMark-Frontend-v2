import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import type { Order } from '../../types/order'
import type { OrderAddressGroup } from '../../domain/orderAddressGroup.flow'
import { OrderAddressGroupCard } from '../cards/OrderAddressGroupCard'

type DraggableOrderAddressGroupCardProps = {
  group: OrderAddressGroup
  expanded: boolean
  isGroupHovered?: boolean
  onToggleExpanded: () => void
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

export const DraggableOrderAddressGroupCard = ({
  group,
  expanded,
  isGroupHovered,
  onToggleExpanded,
  isSelectionMode,
  isOrderSelected,
  onToggleSelection,
  onOpenOrder,
  onArchive,
  onUnarchive,
  hoveredClientId,
  onOrderMouseEnter,
  onOrderMouseLeave,
}: DraggableOrderAddressGroupCardProps) => {
  const representativeOrder = group.orders[0]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `order_group:${group.key}`,
    data: {
      type: 'order_group',
      groupKey: group.key,
      label: group.label,
      orderIds: group.orderIds,
      orderClientIds: group.orders.map((order) => order.client_id),
      orderCount: group.orders.length,
      order: representativeOrder,
    },
  })

  const style: {
    transform: string | undefined
    visibility: 'hidden' | 'visible'
    cursor: string
  } = {
    transform: CSS.Transform.toString(transform),
    visibility: isDragging ? 'hidden' : 'visible',
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <OrderAddressGroupCard
        group={group}
        expanded={expanded}
        isGroupHovered={isGroupHovered}
        onToggleExpanded={onToggleExpanded}
        isSelectionMode={isSelectionMode}
        isOrderSelected={isOrderSelected}
        onToggleSelection={onToggleSelection}
        onOpenOrder={onOpenOrder}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        hoveredClientId={hoveredClientId}
        onOrderMouseEnter={onOrderMouseEnter}
        onOrderMouseLeave={onOrderMouseLeave}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}
