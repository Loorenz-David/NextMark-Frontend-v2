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
  orders: getOrderSnapshot(),
  solutions: getRouteSolutionSnapshot(),
  stops: getRouteSolutionStopSnapshot(),
})

export const restoreOrderOptimisticSnapshot = (
  snapshot: any,
) => {
  restoreOrderSnapshot(snapshot.orders)
  restoreRouteSolutionSnapshot(snapshot.solutions)
  restoreRouteSolutionStopSnapshot(snapshot.stops)
}
