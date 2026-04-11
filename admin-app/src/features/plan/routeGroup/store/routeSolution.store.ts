import type { EntityTable } from "@shared-store"
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"
import {
  selectRouteGroupByServerId,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'
import { selectRoutePlanByServerId, useRoutePlanStore } from '@/features/plan/store/routePlan.slice'

export const useRouteSolutionStore = createEntityStore<RouteSolution>()

export const selectAllRouteSolutions = (state: EntityTable<RouteSolution>) =>
  selectAll<RouteSolution>()(state)

export const selectRouteSolutionByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<RouteSolution>) =>
    selectByClientId<RouteSolution>(clientId)(state)

export const selectRouteSolutionByServerId = (id: number | null | undefined) =>
  (state: EntityTable<RouteSolution>) =>
    selectByServerId<RouteSolution>(id)(state)

export const selectRouteSolutionsByRouteGroupId = (
  routeGroupId: number | null | undefined,
) =>
  (state: EntityTable<RouteSolution>) => {
    if (routeGroupId == null) return []
    return state.allIds.reduce<RouteSolution[]>((acc, clientId) => {
      const solution = state.byClientId[clientId]
      if (solution?.route_group_id === routeGroupId) {
        acc.push(solution)
      }
      return acc
    }, [])
  }

export const selectSelectedRouteSolutionByRouteGroupId = (
  routeGroupId: number | null | undefined,
) =>
  (state: EntityTable<RouteSolution>) => {
    if (routeGroupId == null) return null
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .find(
        (solution) => solution.route_group_id === routeGroupId && solution.is_selected,
      ) ?? null
  }

export const getPlanEndDateByRouteSolutionId = (routeSolutionId?: number | null) => {
  if (routeSolutionId == null) return null
  const solution = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
  if (!solution?.route_group_id) return null
  const localPlan = selectRouteGroupByServerId(solution.route_group_id)(
    useRouteGroupStore.getState(),
  )
  if (!localPlan?.route_plan_id) return null
  const plan = selectRoutePlanByServerId(localPlan.route_plan_id)(useRoutePlanStore.getState())
  return plan?.end_date ?? null
}

export const insertRouteSolution = (solution: RouteSolution) =>
  useRouteSolutionStore.getState().insert(solution)

export const insertRouteSolutions = (table: { byClientId: Record<string, RouteSolution>; allIds: string[] }) =>
  useRouteSolutionStore.getState().insertMany(table)

export const upsertRouteSolution = (solution: RouteSolution) => {
  const state = useRouteSolutionStore.getState()
  if (state.byClientId[solution.client_id]) {
    state.update(solution.client_id, (existing) => ({ ...existing, ...solution }))
    return
  }
  state.insert(solution)
}

export const upsertRouteSolutions = (table: { byClientId: Record<string, RouteSolution>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const solution = table.byClientId[clientId]
    if (solution) {
      upsertRouteSolution(solution)
    }
  })
}

export const updateRouteSolution = (
  clientId: string,
  updater: (solution: RouteSolution) => RouteSolution,
) => useRouteSolutionStore.getState().update(clientId, updater)

export const setSelectedRouteSolution = (selectedId: number, routeGroupId: number | null | undefined) => {
  const state = useRouteSolutionStore.getState()
  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId]
    if (!solution) return
    if (routeGroupId != null && solution.route_group_id !== routeGroupId) return
    const isSelected = solution.id === selectedId
    if (solution.is_selected !== isSelected) {
      state.update(clientId, (existing) => ({
        ...existing,
        is_selected: isSelected,
      }))
    }
  })
}

export const purgeNonSelectedRouteSolutionsForGroup = (routeGroupId: number): string[] => {
  const state = useRouteSolutionStore.getState()
  const affectedClientIds: string[] = []

  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId]
    if (solution?.route_group_id === routeGroupId && !solution.is_selected) {
      affectedClientIds.push(clientId)
    }
  })

  affectedClientIds.forEach((clientId) => {
    state.update(clientId, (solution) => ({
      ...solution,
      _representation: 'summary',
      route_warnings: null,
      has_route_warnings: false,
      start_leg_polyline: null,
      end_leg_polyline: null,
    }))
  })

  return affectedClientIds
}

export const removeRouteSolution = (clientId: string) =>
  useRouteSolutionStore.getState().remove(clientId)

export const clearRouteSolutions = () =>
  useRouteSolutionStore.getState().clear()

export const getRouteSolutionSnapshot = () => {
  const state = useRouteSolutionStore.getState()
  return structuredClone({
    byClientId: state.byClientId,
    idIndex: state.idIndex,
    allIds: state.allIds,
    visibleIds: state.visibleIds,
  })
}

export const restoreRouteSolutionSnapshot = (
  snapshot: {
    byClientId: Record<string, RouteSolution>
    idIndex: Record<number, string>
    allIds: string[]
    visibleIds: string[] | null
  },
) => useRouteSolutionStore.setState(snapshot)
