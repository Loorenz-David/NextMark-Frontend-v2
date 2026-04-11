import type { EntityTable } from "@shared-store"
import type { DeliveryPlanState } from '@/features/plan/types/planState'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"
import { useShallow } from 'zustand/react/shallow'

export const ROUTE_PLAN_STATE_TRANSITIONS: Record<string, string[]> = {
  draft: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const useRoutePlanStateStore = createEntityStore<DeliveryPlanState>()

export const selectAllRoutePlanStates = (state: EntityTable<DeliveryPlanState>) => selectAll<DeliveryPlanState>()(state)

export const useRoutePlanState = () => useRoutePlanStateStore(useShallow(selectAllRoutePlanStates))

export const selectRoutePlanStateByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DeliveryPlanState>) =>
    selectByClientId<DeliveryPlanState>(clientId)(state)

export const selectRoutePlanStateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DeliveryPlanState>) =>
    selectByServerId<DeliveryPlanState>(id)(state)

export const insertRoutePlanState = (routePlanState: DeliveryPlanState) =>
  useRoutePlanStateStore.getState().insert(routePlanState)

export const insertRoutePlanStates = (table: { byClientId: Record<string, DeliveryPlanState>; allIds: string[] }) =>
  useRoutePlanStateStore.getState().insertMany(table)

export const updateRoutePlanState = (clientId: string, updater: (routePlanState: DeliveryPlanState) => DeliveryPlanState) =>
  useRoutePlanStateStore.getState().update(clientId, updater)

export const removeRoutePlanState = (clientId: string) =>
  useRoutePlanStateStore.getState().remove(clientId)

export const clearRoutePlanStates = () =>
  useRoutePlanStateStore.getState().clear()
