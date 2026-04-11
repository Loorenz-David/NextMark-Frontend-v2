import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { routeOptimizationApi } from '@/features/local-delivery-orders/api/routeOptimization.api'
import type {
  RouteOptimizationPayload,
  RouteOptimizationResponse,
} from '@/features/local-delivery-orders/api/routeOptimization.api'
import {
  normalizeRouteOptimizationSolutions,
  normalizeRouteOptimizationStops,
} from '@/features/local-delivery-orders/api/mappers/routeOptimization.mapper'
import { upsertRouteSolution } from '@/features/local-delivery-orders/store/routeSolution.store'
import { upsertRouteSolutionStop } from '@/features/local-delivery-orders/store/routeSolutionStop.store'
import {
  getRouteOptimizationBlockMessage,
  isEndDateInFuture,
} from '@/features/local-delivery-orders/utils/routeOptimizationGuard'
import { getPlanEndDateByLocalDeliveryPlanId } from '@/features/local-delivery-orders/store/localDelivery.slice'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const applyOptimizationPayload = (payload?: RouteOptimizationResponse | null) => {
  if (!payload) return
  normalizeRouteOptimizationSolutions(payload).forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })

  const stops = [
    ...normalizeRouteOptimizationStops(payload.route_solution_stop),
    ...normalizeRouteOptimizationStops(payload.route_solution_stop_skipped),
  ]
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

export function useRouteOptimizationMutations() {
  const { showMessage } = useMessageHandler()

  const createOptimization = useCallback(
    async (payload: RouteOptimizationPayload) => {
      const endDate = getPlanEndDateByLocalDeliveryPlanId(payload.route_group_id)

      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }
      try {
        const response = await routeOptimizationApi.createOptimization(payload)
        applyOptimizationPayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to create route optimization.')
        console.error('Failed to create route optimization', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateOptimization = useCallback(
    async (payload: RouteOptimizationPayload) => {
      const endDate = getPlanEndDateByLocalDeliveryPlanId(payload.route_group_id)
      if (!isEndDateInFuture(endDate)) {
        showMessage({ status: 400, message: getRouteOptimizationBlockMessage() })
        return null
      }
      try {
        const response = await routeOptimizationApi.updateOptimization(payload)
        applyOptimizationPayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route optimization.')
        console.error('Failed to update route optimization', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    createOptimization,
    updateOptimization,
  }
}
