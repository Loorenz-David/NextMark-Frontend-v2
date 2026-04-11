import { useCallback } from 'react'

import { planApi } from '@/features/plan/api/plan.api'
import { useMessageHandler } from '@shared-message-handler'
import { insertRoutePlanStates } from '@/features/plan/store/routePlanState.store'
import type { DeliveryPlanStateQueryFilters } from '@/features/plan/types/planMeta'
import { ApiError } from '@/lib/api/ApiClient'

export function useDeliveryPlanStateQueries() {
  const { showMessage } = useMessageHandler()

  const fetchDeliveryPlanStates = useCallback(
    async (query?: DeliveryPlanStateQueryFilters) => {
      try {
        const response = await planApi.listDeliveryPlanStates(query)
        const payload = response.data

        if (!payload?.route_plan_states) {
          console.warn('Plan states response missing route_plan_states', payload)
          return null
        }

        insertRoutePlanStates(payload.route_plan_states)
        return payload
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load plan states.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch plan states', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return { fetchDeliveryPlanStates }
}
