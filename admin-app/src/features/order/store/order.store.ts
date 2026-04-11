import { createEntityStore } from "@shared-store"
import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId, selectVisible } from "@shared-store"

import type { Order, OrderMap } from '../types/order'

export const useOrderStore = createEntityStore<Order>()
type OrdersByCostumerIndex = Map<number, Set<number>>

const buildOrdersByCostumerIdIndex = (state: EntityTable<Order>): OrdersByCostumerIndex => {
  const index: OrdersByCostumerIndex = new Map()

  state.allIds.forEach((clientId) => {
    const order = state.byClientId[clientId]
    if (!order) return
    if (typeof order.id !== 'number') return
    if (typeof order.costumer_id !== 'number') return

    const existing = index.get(order.costumer_id)
    if (existing) {
      existing.add(order.id)
      return
    }

    index.set(order.costumer_id, new Set([order.id]))
  })

  return index
}

const syncOrdersByCostumerIdIndex = () => {
  const state = useOrderStore.getState()
  const nextIndex = buildOrdersByCostumerIdIndex(state)
  useOrderStore.setState({ ordersByCostumerId: nextIndex } as Partial<EntityTable<Order>> & {
    ordersByCostumerId: OrdersByCostumerIndex
  })
}

type OrderStoreWithIndex = EntityTable<Order> & {
  ordersByCostumerId: OrdersByCostumerIndex
}

useOrderStore.setState(
  { ordersByCostumerId: new Map<number, Set<number>>() } as Partial<EntityTable<Order>> & {
    ordersByCostumerId: OrdersByCostumerIndex
  },
)

export const selectAllOrders = (state: EntityTable<Order>) => selectAll<Order>()(state)

export const selectVisibleOrders = (state: EntityTable<Order>) => selectVisible<Order>()(state)

export const selectOrderByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Order>) => selectByClientId<Order>(clientId)(state)

export const selectOrderByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Order>) => selectByServerId<Order>(id)(state)

export const selectOrdersByCostumerId = (costumerId: number | null | undefined) =>
  (state: EntityTable<Order>) => {
    if (typeof costumerId !== 'number') return []

    const indexedState = state as OrderStoreWithIndex
    const indexedOrderIds = indexedState.ordersByCostumerId?.get(costumerId)
    if (!indexedOrderIds || indexedOrderIds.size === 0) return []

    const serverIdToClientId = state.idIndex
    const byClientId = state.byClientId
    return Array.from(indexedOrderIds)
      .map((orderId) => {
        const clientId = serverIdToClientId[orderId]
        if (!clientId) return null
        return byClientId[clientId] ?? null
      })
      .filter((order): order is Order => Boolean(order))
  }

export const selectOrdersByPlanId = (planId: number | null | undefined) =>
  (state: EntityTable<Order>) => {
    if (planId == null) return []
    return state.allIds.reduce<Order[]>((acc, clientId) => {
      const order = state.byClientId[clientId]
      if (order?.delivery_plan_id === planId) {
        acc.push(order)
      }
      return acc
    }, [])
  }

export const setOrder = (order: Order) => {
  useOrderStore.getState().insert(order)
  syncOrdersByCostumerIdIndex()
}

export const setVisibleOrders = (clientIds: string[] | null) =>
  useOrderStore.getState().setVisibleIds(clientIds)

export const appendVisibleOrders = (clientIds: string[]) => {
  if (clientIds.length === 0) return

  const { visibleIds, setVisibleIds } = useOrderStore.getState()
  const existingIds = visibleIds ?? []
  const existingIdSet = new Set(existingIds)
  const dedupedIncoming = clientIds.filter((clientId) => !existingIdSet.has(clientId))

  if (dedupedIncoming.length === 0) return

  setVisibleIds([...existingIds, ...dedupedIncoming])
}

export const addVisibleOrder = (clientId: string) => {
  const { visibleIds, setVisibleIds } = useOrderStore.getState()
  if (!visibleIds) return
  if (visibleIds.includes(clientId)) return
  setVisibleIds([clientId, ...visibleIds])
}

export const setOrders = (table: OrderMap) => {
  useOrderStore.getState().insertMany(table)
  syncOrdersByCostumerIdIndex()
}

export const updateOrderByClientId = (clientId: string, updater: (order: Order) => Order) =>
{
  useOrderStore.getState().update(clientId, updater)
  syncOrdersByCostumerIdIndex()
}


export const setOrderPlanId = (clientId: string, planId: number | null) =>
{
  useOrderStore.getState().update(clientId, (order) => ({
    ...order,
    delivery_plan_id: planId,
  }))
  syncOrdersByCostumerIdIndex()
}

export const clearOrders = () => {
  useOrderStore.getState().clear()
  syncOrdersByCostumerIdIndex()
}
export const removeOrderByClientId = (clientId: string) => {
  useOrderStore.getState().remove(clientId)
  syncOrdersByCostumerIdIndex()
}

export const upsertOrder = (order: Order) => {
  const state = useOrderStore.getState()
  if (state.byClientId[order.client_id]) {
    state.update(order.client_id, (existing) => ({ ...existing, ...order }))
    syncOrdersByCostumerIdIndex()
    return
  }
  state.insert(order)
  syncOrdersByCostumerIdIndex()
}

export const patchOrderTotals = (
  orderId: number,
  totals: { total_weight?: number | null; total_volume?: number | null; total_items?: number | null },
) => {
  const state = useOrderStore.getState()
  const clientId = state.idIndex[orderId]
  if (!clientId) return
  state.update(clientId, (existing) => ({ ...existing, ...totals }))
}

export const upsertOrders = (table: OrderMap) => {
  table.allIds.forEach((clientId) => {
    const order = table.byClientId[clientId]
    if (order) {
      upsertOrder(order)
    }
  })
}

export const getOrderSnapshot = () => {
  const state = useOrderStore.getState()
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
    ordersByCostumerId: Array.from(
      (state as OrderStoreWithIndex).ordersByCostumerId?.entries?.() ?? [],
    ).map(([costumerId, orderIds]) => [costumerId, Array.from(orderIds)]),
  })
}

export const restoreOrderSnapshot = (
  snapshot: {
      byClientId: Record<string, Order>
      idIndex: Record<number, string>
      allIds: string[]
      visibleIds: string[] | null
      ordersByCostumerId?: Array<[number, number[]]>
    },
) =>
  useOrderStore.setState({
    ...snapshot,
    ordersByCostumerId: new Map<number, Set<number>>(
      (snapshot.ordersByCostumerId ?? []).map(([costumerId, orderIds]) => [
        costumerId,
        new Set(orderIds),
      ]),
    ),
  } as Partial<EntityTable<Order>> & { ordersByCostumerId: OrdersByCostumerIndex })
