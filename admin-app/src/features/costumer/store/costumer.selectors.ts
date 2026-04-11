import { useShallow } from 'zustand/react/shallow'

import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId, selectVisible } from "@shared-store"

import type { Costumer } from '../dto/costumer.dto'
import { useCostumerStore } from './costumer.store'

export const selectAllCostumers = (state: EntityTable<Costumer>) => selectAll<Costumer>()(state)

export const selectVisibleCostumers = (state: EntityTable<Costumer>) => selectVisible<Costumer>()(state)

export const selectCostumerByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Costumer>) => selectByClientId<Costumer>(clientId)(state)

export const selectCostumerByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Costumer>) => selectByServerId<Costumer>(id)(state)

export const useCostumers = () => useCostumerStore(useShallow(selectAllCostumers))

export const useVisibleCostumers = () => useCostumerStore(useShallow(selectVisibleCostumers))

export const useCostumerByClientId = (clientId: string | null | undefined) =>
  useCostumerStore(selectCostumerByClientId(clientId))

export const useCostumerByServerId = (id: number | null | undefined) =>
  useCostumerStore(selectCostumerByServerId(id))

