import type { EntityTable } from "@shared-store"
import type { LocalDeliveryPlan } from '@/features/local-delivery-orders/types/localDeliveryPlan'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"
import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'

export const useLocalDeliveryPlanStore = createEntityStore<LocalDeliveryPlan>()

export const selectAllLocalDeliveryPlans = (state: EntityTable<LocalDeliveryPlan>) =>
  selectAll<LocalDeliveryPlan>()(state)

export const selectLocalDeliveryPlanByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<LocalDeliveryPlan>) =>
    selectByClientId<LocalDeliveryPlan>(clientId)(state)

export const selectLocalDeliveryPlanByServerId = (id: number | null | undefined) =>
  (state: EntityTable<LocalDeliveryPlan>) =>
    selectByServerId<LocalDeliveryPlan>(id)(state)

export const selectLocalDeliveryPlanByPlanId = (planId: number | null | undefined) =>
  (state: EntityTable<LocalDeliveryPlan>) => {
    if (planId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find((plan) => plan.route_plan_id === planId) ?? null
  }

export const getPlanEndDateByLocalDeliveryPlanId = (localDeliveryPlanId?: number | null) => {
  if (localDeliveryPlanId == null) return null
  const localPlan = selectLocalDeliveryPlanByServerId(localDeliveryPlanId)(useLocalDeliveryPlanStore.getState())
  if (!localPlan?.route_plan_id) return null
  const plan = selectRoutePlanByServerId(localPlan.route_plan_id)(useRoutePlanStore.getState())
  return plan?.end_date ?? null
}

export const insertLocalDeliveryPlan = (plan: LocalDeliveryPlan) =>
  useLocalDeliveryPlanStore.getState().insert(plan)

export const insertLocalDeliveryPlans = (table: { byClientId: Record<string, LocalDeliveryPlan>; allIds: string[] }) =>
  useLocalDeliveryPlanStore.getState().insertMany(table)

export const upsertLocalDeliveryPlan = (plan: LocalDeliveryPlan) => {
  const state = useLocalDeliveryPlanStore.getState()
  if (state.byClientId[plan.client_id]) {
    state.update(plan.client_id, (existing) => ({ ...existing, ...plan }))
    return
  }
  state.insert(plan)
}

export const upsertLocalDeliveryPlans = (table: { byClientId: Record<string, LocalDeliveryPlan>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const plan = table.byClientId[clientId]
    if (plan) {
      upsertLocalDeliveryPlan(plan)
    }
  })
}

export const updateLocalDeliveryPlan = (clientId: string, updater: (plan: LocalDeliveryPlan) => LocalDeliveryPlan) =>
  useLocalDeliveryPlanStore.getState().update(clientId, updater)

export const removeLocalDeliveryPlan = (clientId: string) =>
  useLocalDeliveryPlanStore.getState().remove(clientId)

export const clearLocalDeliveryPlans = () =>
  useLocalDeliveryPlanStore.getState().clear()
