import { useShallow } from 'zustand/react/shallow'

import {
  selectAllLocalDeliveryPlans,
  selectLocalDeliveryPlanByClientId,
  selectLocalDeliveryPlanByPlanId,
  selectLocalDeliveryPlanByServerId,
  useLocalDeliveryPlanStore,
} from '@/features/local-delivery-orders/store/localDelivery.slice'

export const useLocalDeliveryPlans = () =>
  useLocalDeliveryPlanStore(useShallow(selectAllLocalDeliveryPlans))

export const useLocalDeliveryPlanByClientId = (clientId: string | null | undefined) =>
  useLocalDeliveryPlanStore(selectLocalDeliveryPlanByClientId(clientId))

export const useLocalDeliveryPlanByServerId = (id: number | null | undefined) =>
  useLocalDeliveryPlanStore(selectLocalDeliveryPlanByServerId(id))

export const useLocalDeliveryPlanByPlanId = (planId: number | null | undefined) =>
  useLocalDeliveryPlanStore(selectLocalDeliveryPlanByPlanId(planId))
