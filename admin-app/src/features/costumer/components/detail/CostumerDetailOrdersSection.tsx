import { useMemo, useState } from 'react'

import { BackArrowIcon2 } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type { Order } from '@/features/order/types/order'
import type { Item } from '@/features/order/item/types'

import { useCostumerDetailContext } from '../../context/CostumerDetailContext'
import { useCostumerOrders } from '../../hooks/useCostumerOrders'
import { useCostumerOrderStats } from '../../hooks/useCostumerOrderStats'
import { useCostumerOrdersLoading } from '../../store/costumerDetailUI.store'
import { CostumerDetailItemsListView } from './CostumerDetailItemsListView'
import { CostumerDetailOrdersListView } from './CostumerDetailOrdersListView'

type DetailViewMode = 'orders' | 'items'

const formatStatValue = (value: number) => value.toFixed(2)

export const CostumerDetailOrdersSection = () => {
  const [viewMode, setViewMode] = useState<DetailViewMode>('orders')
  const { costumer, openOrderDetail, openOrderFormCreateForCostumer } = useCostumerDetailContext()

  const costumerId = typeof costumer?.id === 'number' ? costumer.id : null
  const activeOrderCount = costumer?.active_order_count ?? 0
  const loadingLabel = useCostumerOrdersLoading(costumerId)

  const { orders } = useCostumerOrders({
    costumerId,
    activeOrderCount,
  })

  const orderedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        const aDate = a.creation_date ? new Date(a.creation_date).getTime() : 0
        const bDate = b.creation_date ? new Date(b.creation_date).getTime() : 0
        return bDate - aDate
      }),
    [orders],
  )

  const stats = useCostumerOrderStats({
    costumerId,
    orders: orderedOrders,
  })

  const orderById = useMemo(() => {
    const map = new Map<number, Order>()
    orderedOrders.forEach((order) => {
      if (typeof order.id === 'number') {
        map.set(order.id, order)
      }
    })
    return map
  }, [orderedOrders])

  const handleOpenOrder = (order: Order) => {
    openOrderDetail({ clientId: order.client_id, serverId: order.id })
  }

  const handleOpenOrderByItem = (item: Item) => {
    const order = orderById.get(item.order_id)
    if (!order) return
    openOrderDetail({ clientId: order.client_id, serverId: order.id })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[var(--color-text)]">Orders</span>
            <span className="text-[11px] text-[var(--color-muted)]">
              {stats.totalOrders} total • {stats.totalItems} items • {formatStatValue(stats.totalVolume)} m³ •{' '}
              {formatStatValue(stats.totalWeight)} kg
            </span>
            {loadingLabel ? <span className="text-[11px] text-[var(--color-muted)]">{loadingLabel}</span> : null}
          </div>

          <div className="flex items-center gap-2">
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: () => setViewMode((prev) => (prev === 'orders' ? 'items' : 'orders')),
                ariaLabel: 'Toggle orders and items view',
              }}
            >
              <BackArrowIcon2 className={`h-4 w-4 transition-transform ${viewMode === 'items' ? 'rotate-180' : ''}`} />
            </BasicButton>
            <BasicButton
              params={{
                variant: 'primary',
                onClick: () => openOrderFormCreateForCostumer(costumerId),
                ariaLabel: 'Create order',
              }}
            >
              + Order
            </BasicButton>
          </div>
        </div>
      </div>

      {viewMode === 'orders' ? (
        <CostumerDetailOrdersListView orders={orderedOrders} onOpenOrder={handleOpenOrder} />
      ) : (
        <CostumerDetailItemsListView
          items={stats.items}
          orderById={orderById}
          onOpenOrderByItem={handleOpenOrderByItem}
        />
      )}
    </div>
  )
}
