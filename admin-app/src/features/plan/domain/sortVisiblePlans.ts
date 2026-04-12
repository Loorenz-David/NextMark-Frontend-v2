import type { DeliveryPlan } from '@/features/plan/types/plan'
import { formatDateOnlyInTimeZone } from '@/shared/utils/formatIsoDate'

const resolvePlanDateKey = (plan: DeliveryPlan) => {
  return (
    formatDateOnlyInTimeZone(plan.end_date ?? null)
    ?? formatDateOnlyInTimeZone(plan.start_date ?? null)
    ?? null
  )
}

const isPastPlan = (plan: DeliveryPlan, todayKey: string) => {
  const dateKey = resolvePlanDateKey(plan)
  if (!dateKey) {
    return false
  }

  return dateKey < todayKey
}

export const sortVisiblePlans = (plans: DeliveryPlan[]) => {
  const todayKey = formatDateOnlyInTimeZone(new Date())
  if (!todayKey) {
    return plans
  }

  return [...plans].sort((left, right) => {
    const leftPast = isPastPlan(left, todayKey)
    const rightPast = isPastPlan(right, todayKey)

    if (leftPast !== rightPast) {
      return leftPast ? 1 : -1
    }

    return 0
  })
}
