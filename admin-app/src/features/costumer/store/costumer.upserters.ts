import type { Costumer, CostumerMap } from '../dto/costumer.dto'
import { useCostumerStore } from './costumer.store'

export const setCostumers = (table: CostumerMap) => useCostumerStore.getState().insertMany(table)

export const setCostumer = (costumer: Costumer) => useCostumerStore.getState().insert(costumer)

export const updateCostumerByClientId = (clientId: string, updater: (costumer: Costumer) => Costumer) =>
  useCostumerStore.getState().update(clientId, updater)

export const removeCostumerByClientId = (clientId: string) => useCostumerStore.getState().remove(clientId)

export const upsertCostumer = (costumer: Costumer) => {
  const state = useCostumerStore.getState()
  if (state.byClientId[costumer.client_id]) {
    state.update(costumer.client_id, (existing) => ({ ...existing, ...costumer }))
    return
  }
  state.insert(costumer)
}

export const upsertCostumers = (table: CostumerMap) => {
  table.allIds.forEach((clientId) => {
    const costumer = table.byClientId[clientId]
    if (!costumer) return
    upsertCostumer(costumer)
  })
}
