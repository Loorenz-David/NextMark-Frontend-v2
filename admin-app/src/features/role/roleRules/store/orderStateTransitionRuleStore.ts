import type { EntityTable } from "@shared-store"
import type { OrderStateTransitionRule } from '@/features/role/roleRules/types/roleRule'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useOrderStateTransitionRuleStore = createEntityStore<OrderStateTransitionRule>()

export const selectAllOrderStateTransitionRules = (state: EntityTable<OrderStateTransitionRule>) =>
  selectAll<OrderStateTransitionRule>()(state)

export const selectOrderStateTransitionRuleByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<OrderStateTransitionRule>) =>
    selectByClientId<OrderStateTransitionRule>(clientId)(state)

export const selectOrderStateTransitionRuleByServerId = (id: number | null | undefined) =>
  (state: EntityTable<OrderStateTransitionRule>) =>
    selectByServerId<OrderStateTransitionRule>(id)(state)

export const selectOrderStateTransitionRulesByRoleId = (roleId: number | null | undefined) =>
  (state: EntityTable<OrderStateTransitionRule>) => {
    if (roleId == null) return []
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .filter((rule) => rule.user_role_id === roleId)
  }

export const insertOrderStateTransitionRule = (rule: OrderStateTransitionRule) =>
  useOrderStateTransitionRuleStore.getState().insert(rule)

export const insertOrderStateTransitionRules = (
  table: { byClientId: Record<string, OrderStateTransitionRule>; allIds: string[] },
) => useOrderStateTransitionRuleStore.getState().insertMany(table)

export const upsertOrderStateTransitionRule = (rule: OrderStateTransitionRule) => {
  const state = useOrderStateTransitionRuleStore.getState()
  if (state.byClientId[rule.client_id]) {
    state.update(rule.client_id, (existing) => ({ ...existing, ...rule }))
    return
  }
  state.insert(rule)
}

export const upsertOrderStateTransitionRules = (
  table: { byClientId: Record<string, OrderStateTransitionRule>; allIds: string[] },
) => {
  table.allIds.forEach((clientId) => {
    const rule = table.byClientId[clientId]
    if (rule) {
      upsertOrderStateTransitionRule(rule)
    }
  })
}

export const updateOrderStateTransitionRule = (
  clientId: string,
  updater: (rule: OrderStateTransitionRule) => OrderStateTransitionRule,
) => useOrderStateTransitionRuleStore.getState().update(clientId, updater)

export const removeOrderStateTransitionRule = (clientId: string) =>
  useOrderStateTransitionRuleStore.getState().remove(clientId)

export const clearOrderStateTransitionRules = () =>
  useOrderStateTransitionRuleStore.getState().clear()
