import {
  selectRouteSolutionStopByOrderAndSolution,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import {
  selectRouteSolutionByServerId,
  selectSelectedRouteSolutionByRouteGroupId,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'

export const useRouteSolutionStopByOrderAndSolution = (
  orderId: number | null | undefined,
  routeSolutionId: number | null | undefined,
) => {
  const solution = useRouteSolutionStore(selectRouteSolutionByServerId(routeSolutionId))
  const stop = useRouteSolutionStopStore(
    selectRouteSolutionStopByOrderAndSolution(orderId, routeSolutionId),
  )

  if (!solution?.is_selected) {
    return null
  }

  return stop
}

export const useSelectedRouteSolutionStopByOrderId = (
  orderId: number | null | undefined,
  routeGroupId: number | null | undefined,
) => {
  const selectedSolution = useRouteSolutionStore(
    selectSelectedRouteSolutionByRouteGroupId(routeGroupId),
  )
  const stop = useRouteSolutionStopStore(
    selectRouteSolutionStopByOrderAndSolution(orderId, selectedSolution?.id),
  )

  return selectedSolution?.is_selected ? stop : null
}
