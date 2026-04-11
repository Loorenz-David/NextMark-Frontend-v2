import { createEntityStore } from '@shared-store'
import type { EntityTable } from '@shared-store'
import { selectAll, selectByServerId } from '@shared-store'
import type { OrderState } from '@shared-domain'

export const useOrderStatesStore = createEntityStore<OrderState>()

export const selectAllOrderStates = (state: EntityTable<OrderState>) => selectAll<OrderState>()(state)

export const selectOrderStateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<OrderState>) => selectByServerId<OrderState>(id)(state)
