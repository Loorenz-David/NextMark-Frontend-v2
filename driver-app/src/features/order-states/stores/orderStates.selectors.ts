import type { EntityTable } from '@shared-store'
import type { OrderState } from '@shared-domain'
import { selectAllOrderStates, selectOrderStateByServerId } from './orderStates.store'

export const selectDriverOrderStates = (state: EntityTable<OrderState>) => selectAllOrderStates(state)

export const selectDriverOrderStateByServerId = (
  state: EntityTable<OrderState>,
  id: number | null | undefined,
) => selectOrderStateByServerId(id)(state)
