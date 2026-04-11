import { useMemo } from 'react'

import type { Order } from '@/features/order/types/order'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'

type StopOrderEntry = {
  stop: RouteSolutionStop
  order: Order
}

type StopOrderingResult = {
  orderedStops: RouteSolutionStop[]
  sortedEntries: StopOrderEntry[]
  missingOrders: Order[]
  sortableIds: string[]
}

export const useLocalDeliveryStopOrdering = (
  orders: Order[],
  routeSolutionStops: RouteSolutionStop[],
  stopByOrderId: Map<number, RouteSolutionStop>,
  ordersById: Map<number, Order>,
): StopOrderingResult => {
  const orderedStops = useMemo(
    () =>
      [...routeSolutionStops].sort(
        (a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY),
      ),
    [routeSolutionStops],
  )

  const sortedEntries = useMemo(
    () =>
      orderedStops
        .map((stop) => ({
          stop,
          order: stop.order_id ? ordersById.get(stop.order_id) ?? null : null,
        }))
        .filter((entry): entry is StopOrderEntry => Boolean(entry.order)),
    [orderedStops, ordersById],
  )

  const missingOrders = useMemo(
    () => orders.filter((order) => !stopByOrderId.has(order.id ?? -1)),
    [orders, stopByOrderId],
  )

  const sortableIds = useMemo(
    () => sortedEntries.map((entry) => entry.stop.client_id),
    [sortedEntries],
  )

  return {
    orderedStops,
    sortedEntries,
    missingOrders,
    sortableIds,
  }
}
