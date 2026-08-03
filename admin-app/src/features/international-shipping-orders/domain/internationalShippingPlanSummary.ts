import { formatPlanDateRangeLabel } from '@/features/plan'
import type { DeliveryPlan } from '@/features/plan/types/plan'

export type InternationalShippingPlanSummary = {
  label: string
  dateLabel: string
  orderCount: number
  itemCount: number
}

/**
 * The header view model. Order count prefers the plan's own rollup — it counts
 * every order on the plan, while the loaded list only holds what has been
 * fetched — and falls back to the loaded count before the rollup arrives.
 */
export const buildInternationalShippingPlanSummary = ({
  plan,
  loadedOrderCount,
}: {
  plan: DeliveryPlan | null | undefined
  loadedOrderCount: number
}): InternationalShippingPlanSummary => ({
  label: plan?.label || 'Untitled plan',
  dateLabel: formatPlanDateRangeLabel(plan?.start_date, plan?.end_date),
  orderCount: plan?.total_orders ?? loadedOrderCount,
  itemCount: plan?.total_items ?? 0,
})
