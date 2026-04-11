import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { routeSolutionApi } from '@/features/local-delivery-orders/api/routeSolution.api'
import type {
  RouteSolutionAddressPayload,
  RouteSolutionGetResponse,
  RouteSolutionTimesPayload,
  RouteSolutionUpdateResponse,
} from '@/features/local-delivery-orders/api/routeSolution.api'
import { normalizeByClientIdArray } from '@/features/local-delivery-orders/api/mappers/routeSolutionPayload.mapper'
import {
  selectRouteSolutionByServerId,
  selectRouteSolutionsByLocalDeliveryPlanId,
  setSelectedRouteSolution,
  upsertRouteSolution,
  upsertRouteSolutions,
  useRouteSolutionStore,
} from '@/features/local-delivery-orders/store/routeSolution.store'
import {
  upsertRouteSolutionStop,
  upsertRouteSolutionStops,
} from '@/features/local-delivery-orders/store/routeSolutionStop.store'
import { useOrderStateBatch } from '@/features/order/controllers/orderStateBatch.controller'
import { usePlanStateChanges } from '@/features/plan/controllers/planState.controller'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const applyUpdatePayload = (payload?: RouteSolutionUpdateResponse | null) => {
  if (!payload) return
  const solutions = normalizeByClientIdArray(payload.route_solution)

  solutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })

  const stops = normalizeByClientIdArray(payload.route_solution_stops)
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

const applyGetPayload = (payload?: RouteSolutionGetResponse | null) => {
  if (!payload?.route_solution) return
  if ('byClientId' in payload.route_solution && 'allIds' in payload.route_solution) {
    upsertRouteSolutions(payload.route_solution)
  } else {
    const solutions = normalizeByClientIdArray(payload.route_solution)
    solutions.forEach((solution) => {
      if (solution?.client_id) {
        upsertRouteSolution(solution)
      }
    })
  }
  if (!payload.route_solution_stop) return
  if ('byClientId' in payload.route_solution_stop && 'allIds' in payload.route_solution_stop) {
    upsertRouteSolutionStops(payload.route_solution_stop)
    return
  }
  const stops = normalizeByClientIdArray(payload.route_solution_stop)
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

export function useRouteSolutionMutations() {
  const { showMessage } = useMessageHandler()
  const { rollbackOrderStates, changeOrderStateBatch } = useOrderStateBatch()
  const { changePlanState } = usePlanStateChanges()

  const updateRouteSolutionAddress = useCallback(
    async (payload: RouteSolutionAddressPayload) => {
      try {
        const response = await routeSolutionApi.updateAddress(payload)
        applyUpdatePayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route solution address.')
        console.error('Failed to update route solution address', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateRouteSolutionTimes = useCallback(
    async (payload: RouteSolutionTimesPayload) => {
      try {
        const response = await routeSolutionApi.updateTimes(payload)
        applyUpdatePayload(response.data)
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route solution times.')
        console.error('Failed to update route solution times', error)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const selectRouteSolution = useCallback(
    async (routeSolutionId: number, localDeliveryPlanId: number | null | undefined) => {
      if (localDeliveryPlanId == null) {
        showMessage({ status: 400, message: 'Local delivery plan is required.' })
        return null
      }
      const state = useRouteSolutionStore.getState()
      const previous = selectRouteSolutionsByLocalDeliveryPlanId(localDeliveryPlanId)(state).map((solution) => ({
        client_id: solution.client_id,
        is_selected: solution.is_selected ?? false,
      }))

      setSelectedRouteSolution(routeSolutionId, localDeliveryPlanId)

      try {
        const response = await routeSolutionApi.selectRouteSolution(routeSolutionId)
        applyUpdatePayload(response.data)
        const selected = selectRouteSolutionByServerId(routeSolutionId)(useRouteSolutionStore.getState())
        if (selected && selected._representation !== 'full') {
          const getResponse = await routeSolutionApi.getRouteSolution(routeSolutionId, true)
          applyGetPayload(getResponse.data)
        }
        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to select route solution.')
        console.error('Failed to select route solution', error)
        previous.forEach((entry) => {
          useRouteSolutionStore.getState().update(entry.client_id, (solution) => ({
            ...solution,
            is_selected: entry.is_selected,
          }))
        })
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const routeReadyForDelivery = useCallback(
    async (deliveryPlanId:number) =>{

      const currentOrderStatesMap = changeOrderStateBatch(
        {type:'deliveryPlanId', deliveryPlanId}, 
        'Ready'
      )
      const currentPlanStateMap = changePlanState(deliveryPlanId, 'Ready')

      try{
        
        const response = await routeSolutionApi.routeReadyForDelivery(deliveryPlanId)

        const failed_order_state_updates = response.data?.failed_order_state_updates ?? {}

        if(Object.keys(failed_order_state_updates).length){
          showMessage({
            status: 'warning',
            message: `Some order states could not be updated (${Object.keys(failed_order_state_updates).length}).`,
          })
        }

        return true
      }catch(error){
        const resolved = resolveError(error, 'Unable to mark route solution as ready for delivery.')
        console.error('Failed to update route solution as ready for delivery', error)


        rollbackOrderStates(currentOrderStatesMap)
        changePlanState(
          currentPlanStateMap[0],
          currentPlanStateMap[1] as number 
        )
        showMessage({ status: resolved.status, message: resolved.message })
        return false
      }
    },
    [changeOrderStateBatch, changePlanState, rollbackOrderStates, showMessage]
  )

  return {
    updateRouteSolutionAddress,
    updateRouteSolutionTimes,
    selectRouteSolution,
    routeReadyForDelivery
  }
}
