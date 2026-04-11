import { useLocalDeliveryPlanByServerId } from '@/features/local-delivery-orders/store/useLocalDeliveryPlan.selector'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import {
  useRouteSolutionsByLocalDeliveryPlanId,
  useSelectedRouteSolutionByLocalDeliveryPlanId,
} from '@/features/local-delivery-orders/store/useRouteSolution.selector'

import type { PopupPayload } from './LocalDeliveryEditForm.types'

export const useLocalDeliveryEditFormContextData = (entryPayload?: PopupPayload) => {

  const rawLocalDeliveryPlanId =
    entryPayload?.localDeliveryPlanId ?? entryPayload?.route_group_id ?? null
  const parsedLocalDeliveryPlanId =
    typeof rawLocalDeliveryPlanId === 'string'
      ? Number(rawLocalDeliveryPlanId)
      : rawLocalDeliveryPlanId
  const localDeliveryPlanId =
    typeof parsedLocalDeliveryPlanId === 'number' && Number.isNaN(parsedLocalDeliveryPlanId)
      ? null
      : parsedLocalDeliveryPlanId

  const localDeliveryPlan = useLocalDeliveryPlanByServerId(localDeliveryPlanId)
  const plan = useRoutePlanByServerId(localDeliveryPlan?.route_plan_id)
  const selectedRouteSolution = useSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId)
  const routeSolutions = useRouteSolutionsByLocalDeliveryPlanId(localDeliveryPlanId)

  return {
    localDeliveryPlanId,
    localDeliveryPlan,
    plan,
    selectedRouteSolution,
    routeSolutions,
  }
}
