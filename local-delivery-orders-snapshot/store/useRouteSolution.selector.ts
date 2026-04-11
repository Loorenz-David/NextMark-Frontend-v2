import { useShallow } from 'zustand/react/shallow'

import {
  selectAllRouteSolutions,
  selectRouteSolutionByClientId,
  selectRouteSolutionByServerId,
  selectRouteSolutionsByLocalDeliveryPlanId,
  selectSelectedRouteSolutionByLocalDeliveryPlanId,
  useRouteSolutionStore,
} from '@/features/local-delivery-orders/store/routeSolution.store'

export const useRouteSolutions = () =>
  useRouteSolutionStore(useShallow(selectAllRouteSolutions))

export const useRouteSolutionByClientId = (clientId: string | null | undefined) =>
  useRouteSolutionStore(selectRouteSolutionByClientId(clientId))

export const useRouteSolutionByServerId = (id: number | null | undefined) =>
  useRouteSolutionStore(selectRouteSolutionByServerId(id))

export const useRouteSolutionsByLocalDeliveryPlanId = (
  localDeliveryPlanId: number | null | undefined,
) =>
  useRouteSolutionStore(useShallow(selectRouteSolutionsByLocalDeliveryPlanId(localDeliveryPlanId)))

export const useSelectedRouteSolutionByLocalDeliveryPlanId = (
  localDeliveryPlanId: number | null | undefined,
) =>
  useRouteSolutionStore(selectSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId))


