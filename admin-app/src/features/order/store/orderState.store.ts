import { createEntityStore } from "@shared-store"
import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { OrderState, OrderStateMap } from '../types/orderState'

export const useOrderStateStore = createEntityStore<OrderState>()

export const selectAllOrderStates = (state: EntityTable<OrderState>) => selectAll<OrderState>()(state)

export const selectOrderStateByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<OrderState>) => selectByClientId<OrderState>(clientId)(state)

export const selectOrderStateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<OrderState>) => selectByServerId<OrderState>(id)(state)

export const setOrderState = (orderState: OrderState) => useOrderStateStore.getState().insert(orderState)

export const insertOrderStates = (table: OrderStateMap) => useOrderStateStore.getState().insertMany(table)

export const updateOrderStateByClientId = (
  clientId: string,
  updater: (orderState: OrderState) => OrderState,
) => useOrderStateStore.getState().update(clientId, updater)

export const clearOrderStates = () => useOrderStateStore.getState().clear()
