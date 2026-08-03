import { useEffect, useRef } from 'react'

import { usePlanOrders } from '@/features/plan'
import { usePlanQueries } from '@/features/plan/flows/planQueries.flow'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'

/**
 * Hydrates everything the workspace reads: the plan itself when the panel was
 * opened without it in the store, and the plan's orders.
 *
 * `freshAfter` comes from a notification or a realtime nudge and means "the copy
 * you have is older than this". Orders are refetched whenever it changes, so a
 * plan opened from a notification shows the change that triggered it.
 */
export const useStorePickupPageInitializationFlow = (
  planId: number | null,
  freshAfter?: string | null,
) => {
  const plan = useRoutePlanByServerId(planId)
  const { fetchPlanById } = usePlanQueries()
  const { fetchPlanOrders } = usePlanOrders()
  const requestedPlanIdRef = useRef<number | null>(null)
  const loadedOrdersKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (planId == null) {
      requestedPlanIdRef.current = null
      return
    }
    if (plan || requestedPlanIdRef.current === planId) return

    requestedPlanIdRef.current = planId
    void fetchPlanById(planId)
  }, [fetchPlanById, plan, planId])

  useEffect(() => {
    if (planId == null) {
      loadedOrdersKeyRef.current = null
      return
    }

    const ordersKey = `${planId}:${freshAfter ?? ''}`
    if (loadedOrdersKeyRef.current === ordersKey) return

    loadedOrdersKeyRef.current = ordersKey
    void fetchPlanOrders(planId)
  }, [fetchPlanOrders, freshAfter, planId])

  return { plan }
}
