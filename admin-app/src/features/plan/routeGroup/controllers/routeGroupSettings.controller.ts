import { useCallback } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import {
  routeGroupSettingsApi,
} from '@/features/plan/routeGroup/api/routeGroupSettings.api'
import {
  saveDriverIdPreference,
  saveEtaMessageToleranceMinutesPreference,
  saveEtaToleranceMinutesPreference,
  saveEndLocationPreference,
  saveEndTimePreference,
  saveRouteEndStrategyPreference,
  saveStartLocationPreference,
  saveStartTimePreference,
  saveStopsServiceTimePreference,
} from '@/features/plan/routeGroup/forms/routeGroupEditForm/routeGroupEditForm.storage'
import { normalizeRouteGroupEditFormToSettingsPayload } from '@/features/plan/routeGroup/api/mappers/routeGroupSettings.mapper'
import { normalizeByClientIdArray } from '@/features/plan/routeGroup/api/mappers/routeSolutionPayload.mapper'
import {
  serviceTimeMinutesToSeconds,
  serviceTimeSecondsToMinutes,
} from '@/features/plan/routeGroup/domain/serviceTimeUnits'
import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'
import type { RouteSolution } from '@/features/plan/routeGroup/types/routeSolution'
import type { RouteGroupEditFormState } from '@/features/plan/routeGroup/forms/routeGroupEditForm/RouteGroupEditForm.types'

import {
  selectRoutePlanByServerId,
  updateRoutePlan,
  useRoutePlanStore,
} from '@/features/plan/store/routePlan.slice'
import {
  selectRouteGroupByServerId,
  updateRouteGroup,
  useRouteGroupStore,
} from '@/features/plan/routeGroup/store/routeGroup.slice'
import {
  selectRouteSolutionByServerId,
  setSelectedRouteSolution,
  updateRouteSolution,
  upsertRouteSolution,
  useRouteSolutionStore,
} from '@/features/plan/routeGroup/store/routeSolution.store'
import {
  upsertRouteSolutionStop,
} from '@/features/plan/routeGroup/store/routeSolutionStop.store'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

const applyResponsePayload = (
  payload?: Awaited<ReturnType<typeof routeGroupSettingsApi.updateRouteGroupSettings>>['data'] | null,
) => {
  if (!payload) return

  const solutions = normalizeByClientIdArray(payload.route_solution)
  solutions.forEach((solution) => {
    if (solution?.client_id) {
      upsertRouteSolution(solution)
    }
  })

  const selected = solutions.find((solution) => solution.is_selected && solution.id)
  if (selected?.id) {
    setSelectedRouteSolution(selected.id, selected.route_group_id ?? null)
  }

  const persistedSource = selected ?? solutions[0]
  if (persistedSource) {
    saveStartTimePreference(persistedSource.set_start_time ?? null)
    saveEndTimePreference(persistedSource.set_end_time ?? null)
    if (persistedSource.route_end_strategy) {
      saveRouteEndStrategyPreference(persistedSource.route_end_strategy)
    }
    saveStartLocationPreference(persistedSource.start_location ?? null)
    saveEndLocationPreference(persistedSource.end_location ?? null)
    saveDriverIdPreference(persistedSource.driver_id ?? null)
    saveEtaToleranceMinutesPreference(
      Math.max(0, Math.trunc((persistedSource.eta_tolerance_seconds ?? 0) / 60)),
    )
    saveEtaMessageToleranceMinutesPreference(
      Math.max(0, Math.trunc((persistedSource.eta_message_tolerance ?? 0) / 60)),
    )
    saveStopsServiceTimePreference(
      serviceTimeSecondsToMinutes(persistedSource.stops_service_time ?? null),
    )
  }

  const stops = normalizeByClientIdArray(payload.route_solution_stops)
  stops.forEach((stop) => {
    if (stop?.client_id) {
      upsertRouteSolutionStop(stop)
    }
  })
}

export function useRouteGroupSettingsMutations() {
  const { showMessage } = useMessageHandler()

  const updateRouteGroupSettings = useCallback(
    async (formState: RouteGroupEditFormState) => {
      const payload = normalizeRouteGroupEditFormToSettingsPayload(formState)
      
      const snapshots: {
        plan: DeliveryPlan | null
        local: RouteGroup | null
        route: RouteSolution | null
      } = {
        plan: null,
        local: null,
        route: null,
      }

      if (payload.route_plan?.id) {
        const plan = selectRoutePlanByServerId(payload.route_plan.id)(useRoutePlanStore.getState())
        if (plan) {
          snapshots.plan = { ...plan }
          updateRoutePlan(plan.client_id, (prev: DeliveryPlan) => ({
            ...prev,
            ...payload.route_plan,
          }))
        }
      }

      if (payload.route_group_id) {
        const localPlan = selectRouteGroupByServerId(payload.route_group_id)(
          useRouteGroupStore.getState(),
        )
        if (localPlan) {
          snapshots.local = { ...localPlan }
        }
      }

      const routeSolutionId =
        payload.route_solution?.id ?? payload.route_solution?.route_solution_id
      if (!payload.create_variant_on_save && routeSolutionId) {
        const solution = selectRouteSolutionByServerId(routeSolutionId)(
          useRouteSolutionStore.getState(),
        )
        if (solution) {
          snapshots.route = { ...solution }
          const {
            eta_tolerance_minutes,
            eta_message_tolerance,
            ...routePatchRest
          } = payload.route_solution ?? {}
          const nextRoutePatch = {
            ...routePatchRest,
            eta_tolerance_seconds:
              typeof eta_tolerance_minutes === 'number'
                ? eta_tolerance_minutes * 60
                : solution.eta_tolerance_seconds,
            eta_message_tolerance:
              typeof eta_message_tolerance === 'number'
                ? eta_message_tolerance
                : solution.eta_message_tolerance,
            stops_service_time:
              payload.route_solution?.stops_service_time != null
                ? payload.route_solution.stops_service_time
                : solution.stops_service_time,
          }
          updateRouteSolution(solution.client_id, (prev) => ({
            ...prev,
            ...nextRoutePatch,
          }))
        }
      }

      try {
        const response = await routeGroupSettingsApi.updateRouteGroupSettings(payload)

        if(response?.data){
            applyResponsePayload(response.data)
            return response.data
        }
        return {}
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update route group settings.')
        console.error('Failed to update route group settings', error)

        if (snapshots.plan?.client_id) {
          updateRoutePlan(snapshots.plan.client_id, () => snapshots.plan as DeliveryPlan)
        }
        if (snapshots.local?.client_id) {
          updateRouteGroup(snapshots.local.client_id, () => snapshots.local as RouteGroup)
        }
        if (snapshots.route?.client_id) {
          updateRouteSolution(snapshots.route.client_id, () => snapshots.route as RouteSolution)
        }

        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    updateRouteGroupSettings,
  }
}
