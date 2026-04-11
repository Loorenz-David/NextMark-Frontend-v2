import type { EntityTable } from "@shared-store"
import type { DateRangeAccessRule } from '@/features/role/roleRules/types/roleRule'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useDateRangeAccessRuleStore = createEntityStore<DateRangeAccessRule>()

export const selectAllDateRangeAccessRules = (state: EntityTable<DateRangeAccessRule>) =>
  selectAll<DateRangeAccessRule>()(state)

export const selectDateRangeAccessRuleByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<DateRangeAccessRule>) =>
    selectByClientId<DateRangeAccessRule>(clientId)(state)

export const selectDateRangeAccessRuleByServerId = (id: number | null | undefined) =>
  (state: EntityTable<DateRangeAccessRule>) =>
    selectByServerId<DateRangeAccessRule>(id)(state)

export const selectDateRangeAccessRulesByRoleId = (roleId: number | null | undefined) =>
  (state: EntityTable<DateRangeAccessRule>) => {
    if (roleId == null) return []
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .filter((rule) => rule.user_role_id === roleId)
  }

export const insertDateRangeAccessRule = (rule: DateRangeAccessRule) =>
  useDateRangeAccessRuleStore.getState().insert(rule)

export const insertDateRangeAccessRules = (
  table: { byClientId: Record<string, DateRangeAccessRule>; allIds: string[] },
) => useDateRangeAccessRuleStore.getState().insertMany(table)

export const upsertDateRangeAccessRule = (rule: DateRangeAccessRule) => {
  const state = useDateRangeAccessRuleStore.getState()
  if (state.byClientId[rule.client_id]) {
    state.update(rule.client_id, (existing) => ({ ...existing, ...rule }))
    return
  }
  state.insert(rule)
}

export const upsertDateRangeAccessRules = (
  table: { byClientId: Record<string, DateRangeAccessRule>; allIds: string[] },
) => {
  table.allIds.forEach((clientId) => {
    const rule = table.byClientId[clientId]
    if (rule) {
      upsertDateRangeAccessRule(rule)
    }
  })
}

export const updateDateRangeAccessRule = (clientId: string, updater: (rule: DateRangeAccessRule) => DateRangeAccessRule) =>
  useDateRangeAccessRuleStore.getState().update(clientId, updater)

export const removeDateRangeAccessRule = (clientId: string) =>
  useDateRangeAccessRuleStore.getState().remove(clientId)

export const clearDateRangeAccessRules = () =>
  useDateRangeAccessRuleStore.getState().clear()
