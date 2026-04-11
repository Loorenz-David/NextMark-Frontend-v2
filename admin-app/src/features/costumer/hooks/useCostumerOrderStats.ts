import { useMemo } from 'react'

import { useItemsByOrderIds } from '@/features/order'
import type { Order } from '@/features/order/types/order'

export const useCostumerOrderStats = ({
  costumerId,
  orders,
}: {
  costumerId: number | null
  orders: Order[]
}) => {
  const orderIds = useMemo(
    () =>
      orders
        .map((order) => order.id)
        .filter((id): id is number => typeof id === 'number')
        .sort((a, b) => a - b),
    [orders],
  )

  const orderIdsKey = useMemo(() => orderIds.join(','), [orderIds])
  const items = useItemsByOrderIds(orderIds)

  return useMemo(() => {
    const totalOrders = orders.length
    const totalItems =
      orders.reduce((sum, order) => sum + (order.total_items ?? 0), 0) ||
      items.length
    const totalVolume = orders.reduce((sum, order) => sum + (order.total_volume ?? 0), 0)
    const totalWeight = orders.reduce((sum, order) => sum + (order.total_weight ?? 0), 0)

    return {
      totalOrders,
      totalItems,
      totalVolume,
      totalWeight,
      orderIds,
      orderIdsKey,
      items,
      costumerId,
    }
  }, [costumerId, items, orderIds, orderIdsKey, orders])
}

