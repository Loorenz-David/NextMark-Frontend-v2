import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { routeSolutionApi } from '@/features/plan/routeGroup/api/routeSolution.api'
import type {
  RouteSolutionAddressPayload,
  RouteSolutionFullGetResponse,
  RouteSolutionGetResponse,
  RouteSolutionTimesPayload,
  RouteSolutionUpdateResponse,
} from '@/features/plan/routeGroup/api/routeSolution.api'
import { normalizeByClientIdArray } from '@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper'
import {
  selectRouteSolutionByServerId,
  selectRouteSolutionsByRouteGroupId,
  purgeNonSelectedRouteSolutionsForGroup,
  setSelectedRouteSolution,
  upsertRouteSolution,
  upsertRouteSolutions,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  upsertRouteSolutionStop,
  upsertRouteSolutionStops,
  removeRouteSolutionStopsBySolutionIds,
  replaceRouteSolutionStopsForSolution,
  useRouteSolutionStopStore,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'
import { applyOrderStateUpdatePayload } from '@/features/order/actions/applyOrderStateUpdatePayload.action'
import { useOrderStateBatch } from '@/features/order/controllers/orderStateBatch.controller'
import { usePlanStateChanges } from '@/features/plan/controllers/planState.controller'
import {
  getPreviewedSolutionId,
  useRouteSolutionPreviewStore,
} from '@/features/plan/routeGroup/store/routeSolutionPreview.store'

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

const applyFullGetPayload = (payload?: RouteSolutionFullGetResponse | null) => {
  if (!payload?.route_solution?.client_id || payload.route_solution.id == null) return

  upsertRouteSolution(payload.route_solution)
  replaceRouteSolutionStopsForSolution(
    payload.route_solution.id,
    payload.route_solution_stops,
  )
}

const purgeNonSelectedSolutionsAndStopsForGroup = (routeGroupId: number) => {
  const state = useRouteSolutionStore.getState()
  const solutionIdsToRemove: number[] = []

  state.allIds.forEach((clientId) => {
    const solution = state.byClientId[clientId]
    if (
      solution?.route_group_id === routeGroupId &&
      !solution.is_selected &&
      solution.id != null
    ) {
      solutionIdsToRemove.push(solution.id)
    }
  })

  removeRouteSolutionStopsBySolutionIds(solutionIdsToRemove)
  purgeNonSelectedRouteSolutionsForGroup(routeGroupId)
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
    async (routeSolutionId: number, routeGroupId: number | null | undefined) => {
      if (routeGroupId == null) {
        showMessage({ status: 400, message: 'Local delivery plan is required.' })
        return null
      }
      const state = useRouteSolutionStore.getState()
      const previous = selectRouteSolutionsByRouteGroupId(routeGroupId)(state).map((solution) => ({
        client_id: solution.client_id,
        is_selected: solution.is_selected ?? false,
      }))

      setSelectedRouteSolution(routeSolutionId, routeGroupId)

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

  const previewRouteSolution = useCallback(
    async (routeSolutionId: number, planId: number, routeGroupId: number) => {
      const currentPreview = getPreviewedSolutionId(routeGroupId)
      if (currentPreview === routeSolutionId) {
        return
      }

      const storedSolution = selectRouteSolutionByServerId(routeSolutionId)(
        useRouteSolutionStore.getState(),
      )
      const stopsAlreadyLoaded =
        storedSolution?._representation === 'full' &&
        useRouteSolutionStopStore
          .getState()
          .allIds.some(
            (clientId) =>
              useRouteSolutionStopStore.getState().byClientId[clientId]
                ?.route_solution_id === routeSolutionId,
          )

      if (!stopsAlreadyLoaded) {
        useRouteSolutionPreviewStore.getState().setLoadingPreviewGroupId(routeGroupId)
        try {
          const response = await routeSolutionApi.getRouteSolutionFull(
            planId,
            routeGroupId,
            routeSolutionId,
          )

          if (!response.data) {
            throw new Error('Failed to load route solution')
          }

          applyFullGetPayload(response.data)
        } catch (error) {
          const resolved = resolveError(error, 'Unable to load route solution preview.')
          console.error('Failed to load route solution for preview', error)
          showMessage({ status: resolved.status, message: resolved.message })
          return
        } finally {
          useRouteSolutionPreviewStore.getState().setLoadingPreviewGroupId(null)
        }
      }

      useRouteSolutionPreviewStore.getState().setPreviewedId(routeGroupId, routeSolutionId)
    },
    [showMessage],
  )

  const confirmSelectRouteSolution = useCallback(
    async (routeSolutionId: number, planId: number, routeGroupId: number) => {
      const state = useRouteSolutionStore.getState()
      const previous = selectRouteSolutionsByRouteGroupId(routeGroupId)(state).map((solution) => ({
        client_id: solution.client_id,
        is_selected: solution.is_selected ?? false,
      }))

      setSelectedRouteSolution(routeSolutionId, routeGroupId)

      try {
        const response = await routeSolutionApi.selectRouteSolutionV2(
          planId,
          routeGroupId,
          routeSolutionId,
        )

        if (!response.data) {
          throw new Error('Select failed')
        }

        applyUpdatePayload(response.data)
        useRouteSolutionPreviewStore.getState().clearPreviewedId(routeGroupId)
        purgeNonSelectedSolutionsAndStopsForGroup(routeGroupId)
        return response.data
      } catch (error) {
        previous.forEach((entry) => {
          useRouteSolutionStore.getState().update(entry.client_id, (solution) => ({
            ...solution,
            is_selected: entry.is_selected,
          }))
        })
        const resolved = resolveError(error, 'Unable to select route solution.')
        console.error('Failed to confirm route solution selection', error)
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
        applyOrderStateUpdatePayload(response.data)

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
    previewRouteSolution,
    confirmSelectRouteSolution,
    routeReadyForDelivery
  }
}
