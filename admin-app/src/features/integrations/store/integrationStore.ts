import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId } from "@shared-store"

import type { IntegrationConfig } from '../types/integration'

export const useIntegrationStore = createEntityStore<IntegrationConfig>()

export const selectAllIntegrations = (state: EntityTable<IntegrationConfig>) =>
  selectAll<IntegrationConfig>()(state)

export const selectIntegrationByKey = (key: string | null | undefined) =>
  (state: EntityTable<IntegrationConfig>) =>
    selectByClientId<IntegrationConfig>(key)(state)

export const insertIntegrations = (table: { byClientId: Record<string, IntegrationConfig>; allIds: string[] }) =>
  useIntegrationStore.getState().insertMany(table)

export const upsertIntegration = (config: IntegrationConfig) => {
  const state = useIntegrationStore.getState()
  if (state.byClientId[config.client_id]) {
    state.update(config.client_id, (existing) => ({ ...existing, ...config }))
    return
  }
  state.insert(config)
}

export const clearIntegrations = () => useIntegrationStore.getState().clear()
