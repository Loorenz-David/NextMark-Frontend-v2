import { useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'
import { optimisticTransaction } from '@shared-optimistic'

import { routeSolutionApi } from '@/features/plan/routeGroup/api/routeSolution.api'
import type { RouteSolutionUpdateResponse } from '@/features/plan/routeGroup/api/routeSolution.api'
import { normalizeByClientIdArray } from '@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper'
import {
  getRouteSolutionSnapshot,
  restoreRouteSolutionSnapshot,
  selectRouteSolutionByServerId,
  setSelectedRouteSolution,
  upsertRouteSolution,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  getRouteSolutionStopSnapshot,
  restoreRouteSolutionStopSnapshot,
  selectRouteSolutionStopByClientId,
  selectRouteSolutionStopsBySolutionId,
  upsertRouteSolutionStop,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import {
  getRouteOptimizationBlockMessage,
  isEndDateInFuture,
} from '@/features/plan/routeGroup/utils/routeOptimizationGuard'
import { getPlanEndDateByRouteSolutionId } from '@/features/plan/routeGroup/store/routeSolution.store'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const createRouteStopOptimisticSnapshot = () => ({
  solutions: getRouteSolutionSnapshot(),
  stops: getRouteSolutionStopSnapshot(),
})

const restoreRouteStopOptimisticSnapshot = (
  snapshot: any,
) => {
  restoreRouteSolutionSnapshot(snapshot.solutions)
  restoreRouteSolutionStopSnapshot(snapshot.stops)
}

const toStopOrder = (value: number | null | undefined) =>
  typeof value === 'number' ? value : Number.POSITIVE_INFINITY

const reorderStopBlockByPosition = (
  sortedStops: any[],
  routeStopIds: number[],
  position: number,
) => {
  const movingIdSet = new Set(routeStopIds)
  const moving = sortedStops.filter((stop) => typeof stop.id === 'number' && movingIdSet.has(stop.id))
  if (moving.length !== routeStopIds.length) {
    return null
  }

  const remaining = sortedStops.filter((stop) => !(typeof stop.id === 'number' && movingIdSet.has(stop.id)))
  const maxPosition = remaining.length + 1
  if (position < 1 || position > maxPosition) {
    return null
  }

  const insertIndex = position - 1
  return [
    ...remaining.slice(0, insertIndex),
    ...moving,
    ...remaining.slice(insertIndex),
  ]
}

const applyUpdatePayload = (payload?: RouteSolutionUpdateResponse | null) => {
  if (!payload) return
  const solutions = normalizeByClientIdArray(payload.route_solution)

  solutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
    if (solution?.is_selected && solution?.id) {
      setSelectedRouteSolution(solution.id, solution.route_group_id ?? null)
    }
  })

  const stops = normalizeByClientIdArray(payload.route_solution_stops)
  if (stops.length) {
    stops.forEach((stop) => {
      if (stop?.client_id) {
        upsertRouteSolutionStop(stop)
      }
    })
  }

  if (!solutions.length && stops.length) {
    const routeSolutionIds = Array.from(
      new Set(stops.map((stop) => stop.route_solution_id).filter(Boolean)),
    )
    if (routeSolutionIds.length === 1) {
      const solutionId = routeSolutionIds[0] as number
      const stored = selectRouteSolutionByServerId(solutionId)(useRouteSolutionStore.getState())
      if (stored?.id) {
        setSelectedRouteSolution(stored.id, stored.route_group_id ?? null)
      }
    }
  }
}

export function useRouteSolutionStopMutations() {
  const { showMessage } = useMessageHandler()

  const updateRouteStopPosition = useCallback(
    async (routeStopId: number, position: number) => {
      try {
        const response = await routeSolutionApi.updateStopPosition(routeStopId, position)
        applyUpdatePayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route stop position.')
        console.error('Failed to update route stop position', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateRouteStopPositionOptimistic = useCallback(
    async (activeStopClientId: string, overStopClientId: string) => {
      if (activeStopClientId === overStopClientId) return null
      const state = useRouteSolutionStopStore.getState()
      const activeStop = selectRouteSolutionStopByClientId(activeStopClientId)(state)
      const overStop = selectRouteSolutionStopByClientId(overStopClientId)(state)

      if (!activeStop || !overStop) {
        showMessage({ status: 404, message: 'Route stop not found for reorder.' })
        return null
      }
      if (!activeStop.id) {
        showMessage({ status: 400, message: 'Route stop must be synced before reorder.' })
        return null
      }
      if (!activeStop.route_solution_id) {
        showMessage({ status: 400, message: 'Route stop is missing route solution.' })
        return null
      }

      const endDate = getPlanEndDateByRouteSolutionId(activeStop.route_solution_id)
      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }

      const stops = selectRouteSolutionStopsBySolutionId(activeStop.route_solution_id)(state).sort(
        (a, b) => (a.stop_order ?? Number.POSITIVE_INFINITY) - (b.stop_order ?? Number.POSITIVE_INFINITY),
      )
      const fromIndex = stops.findIndex((stop) => stop.client_id === activeStopClientId)
      const toIndex = stops.findIndex((stop) => stop.client_id === overStopClientId)
      if (fromIndex < 0 || toIndex < 0) return null
      if (fromIndex === toIndex) return null

      const reordered = arrayMove(stops, fromIndex, toIndex)
      let outcome: RouteSolutionUpdateResponse | null = null
      await optimisticTransaction({
        snapshot: createRouteStopOptimisticSnapshot,
        mutate: () => {
          useRouteSolutionStopStore.setState((currentState) => {
            const nextByClientId = { ...currentState.byClientId }

            reordered.forEach((stop, index) => {
              const existing = nextByClientId[stop.client_id]
              if (!existing) return

              const shouldInvalidate = index >= toIndex
              nextByClientId[stop.client_id] = {
                ...existing,
                stop_order: index + 1,
                eta_status: shouldInvalidate ? 'estimated' : existing.eta_status,
                expected_arrival_time: shouldInvalidate ? 'loading' : existing.expected_arrival_time,
              }
            })

            return {
              ...currentState,
              byClientId: nextByClientId,
            }
          })
        },
        request: () => routeSolutionApi.updateStopPosition(activeStop.id as number, toIndex + 1),
        commit: (response) => {
          outcome = response.data
          applyUpdatePayload(response.data)
        },
        rollback: restoreRouteStopOptimisticSnapshot,
        onError: (error) => {
          const resolved = resolveError(error, 'Unable to update route stop position.')
          console.error('Failed to update route stop position', error)
          showMessage({ status: resolved.status, message: resolved.message })
        },
      })
      return outcome
    },
    [showMessage],
  )

  const updateRouteStopGroupPositionOptimistic = useCallback(
    async (params: {
      routeSolutionId: number
      routeStopIds: number[]
      position: number
      anchorStopId: number
    }) => {

      const { routeSolutionId, routeStopIds, position, anchorStopId } = params
      if (!routeStopIds.length) return null

      const endDate = getPlanEndDateByRouteSolutionId(routeSolutionId)
      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }

      const state = useRouteSolutionStopStore.getState()
      const stops = selectRouteSolutionStopsBySolutionId(routeSolutionId)(state).sort(
        (a, b) => toStopOrder(a.stop_order) - toStopOrder(b.stop_order),
      )
      if (!stops.length) return null

      const reordered = reorderStopBlockByPosition(stops, routeStopIds, position)
      if (!reordered) {
        showMessage({ status: 400, message: 'Unable to move grouped stops.' })
        return null
      }

      const currentOrder = stops.map((stop) => stop.client_id)
      const nextOrder = reordered.map((stop) => stop.client_id)

      const isSameOrder = currentOrder.length === nextOrder.length
        && currentOrder.every((value, index) => value === nextOrder[index])
      if (isSameOrder) {
        return null
      }

      let firstChangedIndex = 0
      while (
        firstChangedIndex < currentOrder.length
        && currentOrder[firstChangedIndex] === nextOrder[firstChangedIndex]
      ) {
        firstChangedIndex += 1
      }

      let outcome: RouteSolutionUpdateResponse | null = null
      await optimisticTransaction({
        snapshot: createRouteStopOptimisticSnapshot,
        mutate: () => {
          useRouteSolutionStopStore.setState((currentState) => {
            const nextByClientId = { ...currentState.byClientId }
            reordered.forEach((stop, index) => {
              const existing = nextByClientId[stop.client_id]
              if (!existing) return
              const shouldInvalidateEta = index >= firstChangedIndex
              nextByClientId[stop.client_id] = {
                ...existing,
                stop_order: index + 1,
                eta_status: shouldInvalidateEta ? 'estimated' : existing.eta_status,
                expected_arrival_time: shouldInvalidateEta ? 'loading' : existing.expected_arrival_time,
              }
            })

            return {
              ...currentState,
              byClientId: nextByClientId,
            }
          })
        },
        request: () =>
          routeSolutionApi.updateStopGroupPosition({
            route_solution_id: routeSolutionId,
            route_stop_ids: routeStopIds,
            position,
            anchor_stop_id: anchorStopId,
          }),
        commit: (response) => {
          outcome = response.data
          applyUpdatePayload(response.data)
        },
        rollback: restoreRouteStopOptimisticSnapshot,
        onError: (error) => {
          const resolved = resolveError(error, 'Unable to move grouped stops.')
          console.error('Failed to update grouped route stop position', error)
          showMessage({ status: resolved.status, message: resolved.message })
        },
      })

      return outcome
    },
    [showMessage],
  )

  return {
    updateRouteStopPosition,
    updateRouteStopPositionOptimistic,
    updateRouteStopGroupPositionOptimistic,
  }
}
