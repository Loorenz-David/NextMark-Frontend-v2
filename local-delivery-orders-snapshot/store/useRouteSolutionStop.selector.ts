import {
  selectRouteSolutionStopByOrderAndSolution,
  useRouteSolutionStopStore,
} from '@/features/local-delivery-orders/store/routeSolutionStop.store'
import {
  selectRouteSolutionByServerId,
  selectSelectedRouteSolutionByLocalDeliveryPlanId,
  useRouteSolutionStore,
} from '@/features/local-delivery-orders/store/routeSolution.store'

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
  localDeliveryPlanId: number | null | undefined,
) => {
  const selectedSolution = useRouteSolutionStore(
    selectSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId),
  )
  const stop = useRouteSolutionStopStore(
    selectRouteSolutionStopByOrderAndSolution(orderId, selectedSolution?.id),
  )

  return selectedSolution?.is_selected ? stop : null
}
