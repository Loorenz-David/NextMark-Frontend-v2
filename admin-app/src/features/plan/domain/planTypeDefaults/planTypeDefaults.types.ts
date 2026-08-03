import type { address } from '@/types/address'
import type { PlanTypeDefaults } from '@/features/plan/types/plan'

export type PlanTypeDefaultsContext = {
  getCurrentLocationAddress: () => Promise<address | null>
  planStartDate?: string | Date | null
}

/**
 * Only local delivery has creation defaults to resolve; container plans carry no
 * route-solution settings, so the create controller skips this entirely for them.
 */
export type PlanTypeDefaultsGenerator = (
  ctx: PlanTypeDefaultsContext,
) => Promise<PlanTypeDefaults | undefined>
