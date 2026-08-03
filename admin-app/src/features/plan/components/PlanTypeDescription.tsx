import { PLAN_TYPE_DESCRIPTIONS } from '@/features/plan/domain/planType'
import type { RoutePlanObjective } from '@/features/plan/types/plan'

type PlanTypeDescriptionProps = {
  planType: RoutePlanObjective
}

/** Explains what the selected plan type will do, under the type selector. */
export const PlanTypeDescription = ({ planType }: PlanTypeDescriptionProps) => {
  return (
    <p className="mt-2 rounded-md border border-[var(--color-muted)]/20 bg-[var(--color-primary)]/5 p-3 text-xs text-[var(--color-muted)]">
      {PLAN_TYPE_DESCRIPTIONS[planType]}
    </p>
  )
}
