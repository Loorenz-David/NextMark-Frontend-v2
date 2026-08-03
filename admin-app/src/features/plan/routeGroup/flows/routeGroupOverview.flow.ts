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
  selectRouteSolutionStopsBySolutionId,
  upsertRouteSolutionStops,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { mergeServerRouteStops } from '@/features/plan/routeGroup/domain/mergeServerRouteStops'
import { filterOrderStopsByOrder } from '@/features/order/domain/orderStopResponse'
import { hasPendingOrderMutation } from '@/features/order/store/orderMutationSequence.store'
import { upsertRouteGroups } from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from '@/features/plan/routeGroup/store/activeRouteGroup.store'

type ApplyRouteGroupPayloadOptions = {
  activateRouteGroup?: boolean
  planId?: number | string | null
}

type FetchRouteGroupOverviewOptions = {
  activateRouteGroup?: boolean
  notifyOnError?: boolean
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
      // A move marks the plan stale, so this refetch can land while another move
      // is still in flight and hand back a route that predates it. Orders being
      // moved keep their local state rather than being replaced.
      replaceRouteSolutionStopsForSolution(
        selected.id,
        mergeServerRouteStops({
          incoming: payload.route_solution_stop,
          existing: selectRouteSolutionStopsBySolutionId(selected.id)(
            useRouteSolutionStopStore.getState(),
          ),
          isOrderPending: hasPendingOrderMutation,
        }),
      )
    }
  }
  if (payload.route_solution_stop && !payload.route_solution) {
    const applicableStops = filterOrderStopsByOrder(
      payload.route_solution_stop,
      (orderId) => !hasPendingOrderMutation(orderId),
    )
    if (applicableStops) {
      upsertRouteSolutionStops(applicableStops)
    }
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
    options?: FetchRouteGroupOverviewOptions,
  ) => {
    try {
      const response = await planOverviewApi.getRouteGroupOverview(planId)

      applyRouteGroupPayload(response.data, {
        activateRouteGroup: options?.activateRouteGroup ?? true,
        planId,
      })
      

      return response.data
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to load route group overview.'
      const status = error instanceof ApiError ? error.status : 500
      console.error('Failed to fetch route group overview', error)
      if (options?.notifyOnError ?? true) {
        setOrderListError(message)
        showMessage({ status, message })
      }
      return null
    }
  }, [showMessage])

  return {
    fetchRouteGroupOverview,
  }
}
