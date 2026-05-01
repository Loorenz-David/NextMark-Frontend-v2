import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import type { RouteGroupOverviewResponse } from '@/features/plan/routeGroup/api/planOverview.api'
import { planOverviewApi } from '@/features/plan/routeGroup/api/planOverview.api'
import { upsertOrders } from '@/features/order/store/order.store'
import { setOrderListError } from '@/features/order/store/orderList.store'
import {
  setSelectedRouteSolution,
  upsertRouteSolutions,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  replaceRouteSolutionStopsForSolution,
  upsertRouteSolutionStops,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { upsertRouteGroups } from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from '@/features/plan/routeGroup/store/activeRouteGroup.store'

type ApplyRouteGroupPayloadOptions = {
  activateRouteGroup?: boolean
  planId?: number | string | null
}

const toNumberId = (value: number | string | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string' || value.trim().length === 0) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const resolvePayloadRouteGroupId = (
  payload: RouteGroupOverviewResponse,
) => {
  const selectedRouteSolution = payload.route_solution?.allIds
    .map((clientId) => payload.route_solution.byClientId[clientId])
    .find((solution) => solution?.is_selected)

  if (typeof selectedRouteSolution?.route_group_id === 'number') {
    return selectedRouteSolution.route_group_id
  }

  return payload.route_group?.allIds
    .map((clientId) => payload.route_group.byClientId[clientId])
    .find((routeGroup) => typeof routeGroup?.id === 'number')
    ?.id ?? null
}

export const applyRouteGroupPayload = (
  payload?: RouteGroupOverviewResponse | null,
  options?: ApplyRouteGroupPayloadOptions,
) => {
  if (!payload) return
  if (payload.order) {
    upsertOrders(payload.order)
  }
  if (payload.route_group) {
    upsertRouteGroups(payload.route_group)
  }
  if (payload.route_solution) {
    upsertRouteSolutions(payload.route_solution)
    const selected = payload.route_solution.allIds
      .map((clientId) => payload.route_solution.byClientId[clientId])
      .find((solution) => solution.is_selected)
      ?? payload.route_solution.allIds
        .map((clientId) => payload.route_solution.byClientId[clientId])
        .find((solution) => solution?._representation === 'full')
      ?? payload.route_solution.allIds
        .map((clientId) => payload.route_solution.byClientId[clientId])
        .find(Boolean)
    if (selected?.id) {
      setSelectedRouteSolution(selected.id, selected.route_group_id ?? null)
      replaceRouteSolutionStopsForSolution(selected.id, payload.route_solution_stop ?? null)
    }
  }
  if (payload.route_solution_stop && !payload.route_solution) {
    upsertRouteSolutionStops(payload.route_solution_stop)
  }

  if (options?.activateRouteGroup) {
    const routeGroupId = resolvePayloadRouteGroupId(payload)
    if (typeof routeGroupId === 'number') {
      setActiveRouteGroupId(routeGroupId)

      const planId = toNumberId(options.planId)
      if (planId != null) {
        rememberRouteGroupForPlan(planId, routeGroupId)
      }
    }
  }
}

export function useRouteGroupOverviewFlow() {
  const { showMessage } = useMessageHandler()

  const fetchRouteGroupOverview = useCallback(async (
    planId: number | string,
  ) => {
    try {
      const response = await planOverviewApi.getRouteGroupOverview(planId)

      applyRouteGroupPayload(response.data, {
        activateRouteGroup: true,
        planId,
      })
      

      return response.data
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to load route group overview.'
      const status = error instanceof ApiError ? error.status : 500
      console.error('Failed to fetch route group overview', error)
      setOrderListError(message)
      showMessage({ status, message })
      return null
    }
  }, [showMessage])

  return {
    fetchRouteGroupOverview,
  }
}
