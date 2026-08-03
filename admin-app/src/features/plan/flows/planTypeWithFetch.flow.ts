import { resolvePlanType } from '../domain/planType'
import { useRoutePlanByClientId } from '../store/useRoutePlan.selector'

/**
 * The plan's type, or null while the plan is not in the store. Callers choosing
 * a workspace must treat null as "still resolving" rather than defaulting, or a
 * container plan flashes the route workspace before settling.
 */
export const usePlanTypeWithFetch = (clientId: string | null | undefined) => {
  const plan = useRoutePlanByClientId(clientId)
  return plan ? resolvePlanType(plan) : null
}
