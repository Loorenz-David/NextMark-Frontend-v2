import type { EntityTable } from '@shared-store'
import { createEntityStore, selectAll, selectByClientId, selectByServerId } from '@shared-store'

import type { ClientFormRule, ClientFormRuleMap } from '../types/clientFormRule'

export const useClientFormRuleStore = createEntityStore<ClientFormRule>()

export const selectAllClientFormRules = (state: EntityTable<ClientFormRule>) =>
  selectAll<ClientFormRule>()(state)

export const selectClientFormRuleByClientId =
  (clientId: string | null | undefined) => (state: EntityTable<ClientFormRule>) =>
    selectByClientId<ClientFormRule>(clientId)(state)

export const selectClientFormRuleByServerId =
  (id: number | null | undefined) => (state: EntityTable<ClientFormRule>) =>
    selectByServerId<ClientFormRule>(id)(state)

export const insertClientFormRules = (table: ClientFormRuleMap) =>
  useClientFormRuleStore.getState().insertMany(table)

export const upsertClientFormRule = (rule: ClientFormRule) => {
  const state = useClientFormRuleStore.getState()
  if (state.byClientId[rule.client_id]) {
    state.update(rule.client_id, (existing) => ({ ...existing, ...rule }))
    return
  }
  state.insert(rule)
}

export const removeClientFormRule = (clientId: string) =>
  useClientFormRuleStore.getState().remove(clientId)

export const replaceClientFormRules = (table: ClientFormRuleMap) => {
  const state = useClientFormRuleStore.getState()
  state.clear()
  state.insertMany(table)
}

export const readClientFormRules = () => {
  const state = useClientFormRuleStore.getState()
  return state.allIds.map((clientId) => state.byClientId[clientId])
}
