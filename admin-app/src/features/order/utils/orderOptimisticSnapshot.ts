import {
  getOrderSnapshot,
  restoreOrderSnapshot,
} from '../store/order.store'

import {
  getRouteSolutionSnapshot,
  restoreRouteSolutionSnapshot,
} from '@/features/plan/routeGroup/store/routeSolution.store'

import {
  getRouteSolutionStopSnapshot,
  restoreRouteSolutionStopSnapshot,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'

export const createOrderOptimisticSnapshot = () => ({
  orders: (() => {
    const snapshot = getOrderSnapshot()
    return {
      ...snapshot,
      ordersByCostumerId: snapshot.ordersByCostumerId.map(
        ([costumerId, orderIds]): [number, number[]] => [costumerId as number, orderIds as number[]],
      ),
    }
  })(),
  solutions: getRouteSolutionSnapshot(),
  stops: getRouteSolutionStopSnapshot(),
})

const isOrderOptimisticSnapshot = (
  value: unknown,
): value is ReturnType<typeof createOrderOptimisticSnapshot> =>
  typeof value === 'object' && value !== null &&
  'orders' in value && 'solutions' in value && 'stops' in value

export const restoreOrderOptimisticSnapshot = (
  snapshot: unknown,
) => {
  if (!isOrderOptimisticSnapshot(snapshot)) return
  restoreOrderSnapshot(snapshot.orders)
  restoreRouteSolutionSnapshot(snapshot.solutions)
  restoreRouteSolutionStopSnapshot(snapshot.stops)
}
