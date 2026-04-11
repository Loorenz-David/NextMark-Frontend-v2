import type { ReactElement, RefObject } from 'react'
import { useMemo } from 'react'

import type { Order } from '../../types/order'
import { DraggableOrderCard } from '../cards/DraggableOrderCard'
import { buildOrderAddressGroups } from '../../domain/orderAddressGroup.flow'
import { DraggableOrderAddressGroupCard } from '../cards/DraggableOrderAddressGroupCard'
import { useOrderGroupUIActions, useOrderGroupUIStore } from '../../store/orderGroupUI.store'

type OrderListProps = {
  orders: Order[]
  isSelectionMode?: boolean
  isOrderSelected?: (order: Order) => boolean
  onToggleSelection?: (order: Order) => void
  onEditOrder?: (order: Order) => void
  onOpenOrder?: (order: Order) => void
  onArchive?:(order:Order) => void
  onUnarchive?: (order: Order) => void
  hoveredClientId?: string | null
  onOrderMouseEnter?: (order: Order) => void
  onOrderMouseLeave?: () => void
  scrollContainerRef?: RefObject<HTMLElement | null>
}

type OrderRow = {
  key: string
  render: () => ReactElement | null
}

export const OrderList = ({
  orders,
  isSelectionMode = false,
  isOrderSelected,
  onToggleSelection,
  onOpenOrder,
  onArchive,
  onUnarchive,
  hoveredClientId,
  onOrderMouseEnter,
  onOrderMouseLeave,
  scrollContainerRef: _scrollContainerRef,
}: OrderListProps) => {
  const groups = useMemo(() => buildOrderAddressGroups(orders), [orders])
  const expandedGroupsByKey = useOrderGroupUIStore((state) => state.expandedGroupsByKey)
  const { toggleGroup } = useOrderGroupUIActions()

  const rows = useMemo<OrderRow[]>(() => groups.map((group) => {
    if (group.orders.length <= 1) {
      const order = group.orders[0]
      return {
        key: order?.client_id ?? group.key,
        render: () => {
          if (!order) return null
          return (
            <DraggableOrderCard
              key={order.client_id}
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
          )
        },
      }
    }

    const uiKey = `order:${group.key}`
    const expanded = expandedGroupsByKey[uiKey] ?? false
    const isGroupHovered = Boolean(
      hoveredClientId && group.orders.some((order) => order.client_id === hoveredClientId),
    )

    return {
      key: group.key,
      render: () => (
        <DraggableOrderAddressGroupCard
          key={group.key}
          group={group}
          expanded={expanded}
          isGroupHovered={isGroupHovered}
          onToggleExpanded={() => toggleGroup(uiKey)}
          isSelectionMode={isSelectionMode}
          isOrderSelected={isOrderSelected}
          onToggleSelection={onToggleSelection}
          onOpenOrder={onOpenOrder}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          hoveredClientId={hoveredClientId}
          onOrderMouseEnter={onOrderMouseEnter}
          onOrderMouseLeave={onOrderMouseLeave}
        />
      ),
    }
  }), [
    expandedGroupsByKey,
    groups,
    hoveredClientId,
    isOrderSelected,
    isSelectionMode,
    onArchive,
    onOpenOrder,
    onOrderMouseEnter,
    onOrderMouseLeave,
    onToggleSelection,
    onUnarchive,
    toggleGroup,
  ])

  if (orders.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-x-hidden px-2 pb-10 pt-4">
      {rows.map((row) => row.render())}
    </div>
  )
}
