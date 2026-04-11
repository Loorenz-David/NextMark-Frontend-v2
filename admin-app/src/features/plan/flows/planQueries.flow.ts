import { useCallback } from 'react'

import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { planApi } from '@/features/plan/api/plan.api'
import type { DeliveryPlan, DeliveryPlanMap } from '@/features/plan/types/plan'
import type { PlanQueryFilters } from '@/features/plan/types/planMeta'
import { insertRoutePlans, upsertRoutePlan } from '@/features/plan/store/routePlan.slice'
import { setRoutePlanListError } from '@/features/plan/store/routePlanList.store'

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const removeEmptyEntries = (input: Record<string, unknown>) => (
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
)

const buildNestedFilters = (query: PlanQueryFilters): Record<string, unknown> => {
  const {
    mode,
    start_date,
    end_date,
    after_cursor,
    before_cursor,
    limit,
    sort,
    filters,
    ...filterableFields
  } = query

  const base = isRecord(filters) ? filters : {}
  return removeEmptyEntries({
    ...base,
    ...filterableFields,
  })
}

export const normalizePlanQueryForRequest = (query?: PlanQueryFilters): PlanQueryFilters | undefined => {
  if (!query) {
    return undefined
  }

  const cleaned = removeEmptyEntries(query)
  const nestedFilters = buildNestedFilters(cleaned as PlanQueryFilters)

  const {
    mode,
    start_date,
    end_date,
    after_cursor,
    before_cursor,
    limit,
    sort,
  } = cleaned as PlanQueryFilters

  const normalizedMode = mode === 'month' || mode === 'date' || mode === 'range'
    ? mode
    : undefined
  const safeMode = normalizedMode && start_date && end_date ? normalizedMode : undefined

  return {
    ...removeEmptyEntries({
      mode: safeMode,
      start_date,
      end_date,
      after_cursor,
      before_cursor,
      limit,
      sort,
    }),
    filters: nestedFilters,
  }
}

export const buildPlanQueryKey = (query?: PlanQueryFilters) => JSON.stringify(normalizePlanQueryForRequest(query) ?? {})

export function usePlanQueries() {
  const { showMessage } = useMessageHandler()

  const fetchPlansPage = useCallback(
    async (query?: PlanQueryFilters) => {
      try {
        const requestQuery = normalizePlanQueryForRequest(query)
        const response = await planApi.listPlans(requestQuery)

        const payload = response.data

        if (!payload?.route_plan) {
          console.warn('Plan list response missing route_plan', payload)
          setRoutePlanListError('Missing route plans response.')
          return null
        }

        insertRoutePlans(payload.route_plan)

        return payload
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load delivery plans.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch delivery plans', error)
        setRoutePlanListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchPlanById = useCallback(
    async (planId: number | string) => {
      try {
        const response = await planApi.getPlan(planId)
        const payload = response.data

        const normalized = normalizeEntityMap<DeliveryPlan>(payload?.route_plan as DeliveryPlanMap | DeliveryPlan)
        if (!normalized) {
          console.warn('Plan response missing route_plan', payload)
          return null
        }

        if (normalized.allIds.length === 1) {
          upsertRoutePlan(normalized.byClientId[normalized.allIds[0]])
        } else {
          insertRoutePlans(normalized)
        }

        return normalized
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load delivery plan.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch delivery plan', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return {
    fetchPlansPage,
    fetchPlanById,
  }
}
