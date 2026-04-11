import type { DriverOrderRecord } from '../domain'
import { useOrdersStore } from './orders.store'
import type { EntityState } from '@shared-store'
import type { DriverOrderCommandDeltaPayload } from '@/features/route-execution/domain/mapOrderCommandDeltas'

export const setOrders = (orders: { byClientId: Record<string, DriverOrderRecord>; allIds: string[] }) =>
  useOrdersStore.getState().insertMany(orders)

export const clearOrders = () => useOrdersStore.getState().clear()

export function createOrdersSnapshotByServerIds(orderIds: number[]): EntityState<DriverOrderRecord> {
  const state = useOrdersStore.getState()
  const snapshotEntries = orderIds
    .map((orderId) => {
      const clientId = state.idIndex[orderId]
      if (!clientId) {
        return null
      }

      const order = state.byClientId[clientId]
      if (!order) {
        return null
      }

      return [clientId, order] as const
    })
    .filter((entry): entry is readonly [string, DriverOrderRecord] => Boolean(entry))

  return {
    byClientId: Object.fromEntries(snapshotEntries),
    allIds: snapshotEntries.map(([clientId]) => clientId),
    idIndex: Object.fromEntries(
      snapshotEntries
        .filter(([, order]) => order.id != null)
        .map(([clientId, order]) => [order.id as number, clientId]),
    ),
  }
}

export function restoreOrdersSnapshot(snapshot: EntityState<DriverOrderRecord>) {
  if (snapshot.allIds.length === 0) {
    return
  }

  useOrdersStore.getState().insertMany(snapshot)
}

export function patchOrderStateByServerIds(orderIds: number[], orderStateId: number) {
  const state = useOrdersStore.getState()
  const clientIds = orderIds
    .map((orderId) => state.idIndex[orderId])
    .filter((clientId): clientId is string => Boolean(clientId))

  if (clientIds.length === 0) {
    return
  }

  useOrdersStore.getState().patchMany(clientIds, {
    order_state_id: orderStateId,
  })
}

export function applyOrderCommandDeltas(deltas: DriverOrderCommandDeltaPayload) {
  const store = useOrdersStore.getState()

  for (const clientId of deltas.allIds) {
    const delta = deltas.byClientId[clientId]
    if (!delta) {
      continue
    }

    store.patch(clientId, {
      order_state_id: delta.order_state_id,
      open_order_cases: delta.open_order_cases,
    })
  }
}
