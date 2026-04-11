import type { EntityTable } from "@shared-store"
import type { RouteSolutionStop } from '@/features/local-delivery-orders/types/routeSolutionStop'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useRouteSolutionStopStore = createEntityStore<RouteSolutionStop>()

export const selectAllRouteSolutionStops = (state: EntityTable<RouteSolutionStop>) =>
  selectAll<RouteSolutionStop>()(state)

export const selectRouteSolutionStopByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<RouteSolutionStop>) =>
    selectByClientId<RouteSolutionStop>(clientId)(state)

export const selectRouteSolutionStopByServerId = (id: number | null | undefined) =>
  (state: EntityTable<RouteSolutionStop>) =>
    selectByServerId<RouteSolutionStop>(id)(state)

export const selectRouteSolutionStopsBySolutionId = (solutionId: number | null | undefined) =>
  (state: EntityTable<RouteSolutionStop>) => {
    if (solutionId == null) return []
    return state.allIds.reduce<RouteSolutionStop[]>((acc, clientId) => {
      const stop = state.byClientId[clientId]
      if (stop?.route_solution_id === solutionId) {
        acc.push(stop)
      }
      return acc
    }, [])
  }

export const selectRouteSolutionStopByOrderAndSolution = (
  orderId: number | null | undefined,
  solutionId: number | null | undefined,
) =>
  (state: EntityTable<RouteSolutionStop>) => {
    if (orderId == null || solutionId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find((stop) => stop.order_id === orderId && stop.route_solution_id === solutionId) ?? null
  }

export const selectRouteSolutionStopsByOrderId = (orderId: number | null | undefined) =>
  (state: EntityTable<RouteSolutionStop>) => {
    if (orderId == null) return []
    return state.allIds.reduce<RouteSolutionStop[]>((acc, clientId) => {
      const stop = state.byClientId[clientId]
      if (stop?.order_id === orderId) {
        acc.push(stop)
      }
      return acc
    }, [])
  }

export const insertRouteSolutionStop = (stop: RouteSolutionStop) =>
  useRouteSolutionStopStore.getState().insert(stop)

export const insertRouteSolutionStops = (table: { byClientId: Record<string, RouteSolutionStop>; allIds: string[] }) =>
  useRouteSolutionStopStore.getState().insertMany(table)

export const upsertRouteSolutionStop = (stop: RouteSolutionStop) => {
  const state = useRouteSolutionStopStore.getState()
  if (state.byClientId[stop.client_id]) {
    state.update(stop.client_id, (existing) => ({ ...existing, ...stop }))
    return
  }
  state.insert(stop)
}

export const upsertRouteSolutionStops = (table: { byClientId: Record<string, RouteSolutionStop>; allIds: string[] }) => {
  if (!table?.allIds?.length) return

  useRouteSolutionStopStore.setState((state) => {
    const nextByClientId = { ...state.byClientId }
    const nextAllIds = [...state.allIds]
    const knownIds = new Set(nextAllIds)

    for (const clientId of table.allIds) {
      const incoming = table.byClientId[clientId]
      if (!incoming) continue

      const existing = nextByClientId[clientId]
      nextByClientId[clientId] = existing ? { ...existing, ...incoming } : incoming

      if (!knownIds.has(clientId)) {
        knownIds.add(clientId)
        nextAllIds.push(clientId)
      }
    }

    const nextIdIndex: Record<number, string> = {}
    for (const clientId of nextAllIds) {
      const stop = nextByClientId[clientId]
      if (stop?.id !== null && stop?.id !== undefined) {
        nextIdIndex[stop.id] = stop.client_id
      }
    }

    return {
      byClientId: nextByClientId,
      allIds: nextAllIds,
      idIndex: nextIdIndex,
    }
  })
}

export const replaceRouteSolutionStopsForSolution = (
  solutionId: number | null | undefined,
  table: { byClientId: Record<string, RouteSolutionStop>; allIds: string[] } | null | undefined,
) => {
  if (solutionId == null) return

  useRouteSolutionStopStore.setState((state) => {
    const nextByClientId = { ...state.byClientId }
    const nextAllIds = state.allIds.filter((clientId) => {
      const stop = state.byClientId[clientId]
      if (stop?.route_solution_id !== solutionId) {
        return true
      }
      delete nextByClientId[clientId]
      return false
    })

    const incomingIds = table?.allIds ?? []
    for (const clientId of incomingIds) {
      const incoming = table?.byClientId?.[clientId]
      if (!incoming) continue
      nextByClientId[clientId] = incoming
      nextAllIds.push(clientId)
    }

    const nextIdIndex: Record<number, string> = {}
    for (const clientId of nextAllIds) {
      const stop = nextByClientId[clientId]
      if (stop?.id !== null && stop?.id !== undefined) {
        nextIdIndex[stop.id] = stop.client_id
      }
    }

    return {
      byClientId: nextByClientId,
      allIds: nextAllIds,
      idIndex: nextIdIndex,
    }
  })
}

export const updateRouteSolutionStop = (
  clientId: string,
  updater: (stop: RouteSolutionStop) => RouteSolutionStop,
) => useRouteSolutionStopStore.getState().update(clientId, updater)

export const removeRouteSolutionStop = (clientId: string) =>
  useRouteSolutionStopStore.getState().remove(clientId)

export const removeRouteSolutionStopsByOrderId = (orderId: number | null | undefined) => {
  if (orderId == null) return
  const state = useRouteSolutionStopStore.getState()
  state.allIds.forEach((clientId) => {
    const stop = state.byClientId[clientId]
    if (stop?.order_id === orderId) {
      state.remove(clientId)
    }
  })
}

export const clearRouteSolutionStops = () =>
  useRouteSolutionStopStore.getState().clear()

export const getRouteSolutionStopSnapshot = () => {
  const state = useRouteSolutionStopStore.getState()
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
  })
}

export const restoreRouteSolutionStopSnapshot = (
  snapshot: {
    byClientId: Record<string, RouteSolutionStop>
    idIndex: Record<number, string>
    allIds: string[]
    visibleIds: string[] | null
  },
) => useRouteSolutionStopStore.setState(snapshot)
