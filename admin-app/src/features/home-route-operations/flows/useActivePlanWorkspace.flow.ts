import { useEffect, useRef, useState } from 'react'

import { resolvePlanType } from '@/features/plan/domain/planType'
import { usePlanQueries } from '@/features/plan/flows/planQueries.flow'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import type { RoutePlanObjective } from '@/features/plan/types/plan'
import type { BaseControls } from '@/shared/resource-manager/types'

import { planWorkspaceRegistry, type PlanWorkspaceProps } from '../registry/planWorkspaceRegistry'
import type { PayloadBase } from '../types/types'

export type ActivePlanWorkspace =
  | { status: 'idle'; planType: null; Workspace: null; isLocalDeliveryWorkspace: false }
  | { status: 'resolving'; planType: null; Workspace: null; isLocalDeliveryWorkspace: false }
  | {
      status: 'ready'
      planType: RoutePlanObjective
      Workspace: React.ComponentType<PlanWorkspaceProps>
      isLocalDeliveryWorkspace: boolean
    }

/**
 * Resolves which workspace the open plan panel should render.
 *
 * The panel payload carries only a plan id, so the type has to come from the
 * plan itself. Opening a plan that is not in the store yet — a notification
 * target, a reload with the panel open — fetches it once and reports
 * `resolving` in the meantime. Defaulting during that window would flash the
 * route workspace for a container plan and mount the route map runtime with
 * nothing to draw, so the shell waits instead of guessing.
 *
 * A fetch that fails still settles to `ready` with the default type, so a
 * transient network error leaves a usable panel rather than a permanent spinner.
 */
export const useActivePlanWorkspace = (
  baseControlls: BaseControls<PayloadBase>,
): ActivePlanWorkspace => {
  const { fetchPlanById } = usePlanQueries()
  const planId =
    typeof baseControlls.payload?.planId === 'number'
      ? baseControlls.payload.planId
      : null
  const isOpen = baseControlls.isBaseOpen && planId != null
  const plan = useRoutePlanByServerId(planId)
  const [failedPlanId, setFailedPlanId] = useState<number | null>(null)
  const attemptedPlanIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen || planId == null || plan) {
      if (planId == null) {
        attemptedPlanIdRef.current = null
      }
      return
    }

    if (attemptedPlanIdRef.current === planId) return
    attemptedPlanIdRef.current = planId

    let cancelled = false
    void fetchPlanById(planId).then((result) => {
      if (cancelled || result) return
      setFailedPlanId(planId)
    })

    return () => {
      cancelled = true
    }
  }, [fetchPlanById, isOpen, plan, planId])

  if (!isOpen) {
    return {
      status: 'idle',
      planType: null,
      Workspace: null,
      isLocalDeliveryWorkspace: false,
    }
  }

  if (!plan && failedPlanId !== planId) {
    return {
      status: 'resolving',
      planType: null,
      Workspace: null,
      isLocalDeliveryWorkspace: false,
    }
  }

  const planType = resolvePlanType(plan)

  return {
    status: 'ready',
    planType,
    Workspace: planWorkspaceRegistry[planType],
    isLocalDeliveryWorkspace: planType === 'local_delivery',
  }
}
