import { useEffect, useRef } from 'react'
import { shouldRefreshForFreshness } from '@shared-utils'

import { useLocalDeliveryOverviewFlow } from '@/features/local-delivery-orders/flows/localDeliveryOverview.flow'
import { useLocalDeliveryPlanByPlanId } from '@/features/local-delivery-orders/store/useLocalDeliveryPlan.selector'
import {
  useRouteSolutionsByLocalDeliveryPlanId,
  useSelectedRouteSolutionByLocalDeliveryPlanId,
} from '@/features/local-delivery-orders/store/useRouteSolution.selector'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'

export const useLocalDeliveryBootstrapFlow = (planId: number, freshAfter?: string | null) => {
  const { fetchLocalDeliveryOverview } = useLocalDeliveryOverviewFlow()
  const plan = useRoutePlanByServerId(planId)
  const localDeliveryPlan = useLocalDeliveryPlanByPlanId(planId)
  const localDeliveryPlanId = localDeliveryPlan?.id ?? null
  const routeSolutions = useRouteSolutionsByLocalDeliveryPlanId(localDeliveryPlanId)
  const selectedRouteSolution = useSelectedRouteSolutionByLocalDeliveryPlanId(localDeliveryPlanId)
  const lastRefreshAttemptRef = useRef<string | null>(null)

  useEffect(() => {
    if (planId == null) {
      lastRefreshAttemptRef.current = null
      return
    }

    const isWorkspaceHydrated = Boolean(
      localDeliveryPlan
      && routeSolutions.length > 0
      && selectedRouteSolution,
    )
    const needsRefresh = (
      plan == null
      || !isWorkspaceHydrated
      || shouldRefreshForFreshness(plan.updated_at ?? null, freshAfter ?? null)
    )
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null
      return
    }

    const refreshKey = `${planId}:${freshAfter ?? ''}`
    if (lastRefreshAttemptRef.current === refreshKey) {
      return
    }
    lastRefreshAttemptRef.current = refreshKey

    fetchLocalDeliveryOverview(planId)
  }, [
    fetchLocalDeliveryOverview,
    freshAfter,
    localDeliveryPlan,
    plan,
    planId,
    routeSolutions.length,
    selectedRouteSolution,
  ])
}
