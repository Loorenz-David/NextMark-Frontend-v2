import type { address } from '@/types/address'
import type { PlanTypeDefaults } from '@/features/plan/types/plan'

export type PlanTypeDefaultsContext = {
  getCurrentLocationAddress: () => Promise<address | null>
  planStartDate?: string | Date | null
}

export type PlanTypeDefaultsGenerator = (
  ctx: PlanTypeDefaultsContext,
) => Promise<PlanTypeDefaults | undefined>

export type PlanTypeDefaultsResolver = (
  planType: 'local_delivery',
  ctx: PlanTypeDefaultsContext,
) => Promise<PlanTypeDefaults | undefined>
