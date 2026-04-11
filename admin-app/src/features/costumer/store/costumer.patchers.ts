import type { Costumer } from '../dto/costumer.dto'
import { useCostumerStore } from './costumer.store'

export const patchCostumerByClientId = (clientId: string, partial: Partial<Costumer>) =>
  useCostumerStore.getState().patch(clientId, partial)

export const patchCostumersByClientIds = (clientIds: string[], partial: Partial<Costumer>) =>
  useCostumerStore.getState().patchMany(clientIds, partial)

export const setVisibleCostumerIds = (clientIds: string[] | null) =>
  useCostumerStore.getState().setVisibleIds(clientIds)
