import { useMemo } from 'react'

import type { Order } from '@/features/order/types/order'
import { getLocalDeliveryBoundaryLocations } from '@/features/local-delivery-orders/domain/getLocalDeliveryBoundaryLocations'
import type { RouteSolution } from '@/features/local-delivery-orders/types/routeSolution'
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import { usePlanStateRegistryFlow } from '@/features/plan/flows/planStateRegistry.flow'

type Params = {
  plan: DeliveryPlan | null | undefined
  orders: Order[]
  routeSolutions: RouteSolution[]
  routeSolutionStops: RouteSolutionStop[]
  selectedRouteSolution: RouteSolution | null
}

export const useLocalDeliveryDerivedFlow = ({
  plan,
  orders,
  routeSolutions,
  routeSolutionStops,
  selectedRouteSolution,
}: Params) => {
  const planStateRegistry = usePlanStateRegistryFlow()
  const planState = planStateRegistry.getById(plan?.state_id ?? null)
  const routeSolutionsOrdered = useMemo(
    () =>
      [...routeSolutions].sort((a, b) => {
        const aLabel = (a.label || '').toLowerCase()
        const bLabel = (b.label || '').toLowerCase()
        if (aLabel && bLabel) return aLabel.localeCompare(bLabel)
        return (a.id ?? 0) - (b.id ?? 0)
      }),
    [routeSolutions],
  )

  const bestRouteSolutionId = useMemo(() => {
    const scored = routeSolutions.filter((solution) => typeof solution.score === 'number')
    if (!scored.length) return null
    return scored.reduce((best, current) =>
      (current.score ?? Infinity) < (best.score ?? Infinity) ? current : best,
    ).id ?? null
  }, [routeSolutions])

  const isSelectedSolutionOptimized =
    selectedRouteSolution?.is_optimized === 'optimize' ||
    selectedRouteSolution?.is_optimized === 'partial optimize'

  const stopByOrderId = useMemo(() => {
    const stopMap = new Map<number, RouteSolutionStop>()
    routeSolutionStops.forEach((stop) => {
      if (stop.order_id != null && stop.stop_order != null) {
        stopMap.set(stop.order_id, stop)
      }
    })
    return stopMap
  }, [routeSolutionStops])

  const ordersById = useMemo(() => {
    const orderMap = new Map<number, Order>()
    orders.forEach((order) => {
      if (order.id != null) {
        orderMap.set(order.id, order)
      }
    })
    return orderMap
  }, [orders])

  const boundaryLocations = useMemo(
    () => getLocalDeliveryBoundaryLocations(stopByOrderId, ordersById, selectedRouteSolution),
    [ordersById, selectedRouteSolution, stopByOrderId],
  )

  return {
    planState,
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  }
}
