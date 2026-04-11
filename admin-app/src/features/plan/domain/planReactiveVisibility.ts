import type { DeliveryPlan } from '@/features/plan/types/plan'
import type { PlanQueryFilters } from '@/features/plan/types/planMeta'

const toDayTimestamp = (value?: string | null): number | null => {
  if (!value) {
    return null
  }

  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    return null
  }

  const date = new Date(parsed)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

export const resolvePlanQueryFilters = (query?: PlanQueryFilters): PlanQueryFilters => {
  if (!query) {
    return {}
  }

  const nestedFilters = isRecord(query.filters) ? query.filters : {}
  return {
    ...query,
    ...nestedFilters,
    filters: isRecord(query.filters) ? query.filters : undefined,
  }
}

export const reactivePlanVisibility = (
  plan: DeliveryPlan,
  query?: PlanQueryFilters,
): boolean => {
  const filters = resolvePlanQueryFilters(query)

  if (filters.plan_type && filters.plan_type !== 'local_delivery') {
    return false
  }

  if (typeof filters.plan_state_id === 'number' && (plan.state_id ?? null) !== filters.plan_state_id) {
    return false
  }

  if (typeof filters.label === 'string' && filters.label.trim().length > 0) {
    const queryLabel = filters.label.trim().toLowerCase()
    const planLabel = (plan.label ?? '').toLowerCase()
    if (!planLabel.includes(queryLabel)) {
      return false
    }
  }

  const filterStart = toDayTimestamp(filters.start_date)
  const filterEnd = toDayTimestamp(filters.end_date)
  if (filterStart !== null || filterEnd !== null) {
    const planStart = toDayTimestamp(plan.start_date)
    const planEnd = toDayTimestamp(plan.end_date)
    const normalizedPlanStart = planStart ?? planEnd
    const normalizedPlanEnd = planEnd ?? planStart

    if (normalizedPlanStart === null || normalizedPlanEnd === null) {
      return false
    }

    if (filterStart !== null && normalizedPlanEnd < filterStart) {
      return false
    }

    if (filterEnd !== null && normalizedPlanStart > filterEnd) {
      return false
    }
  }

  const createdAt = toDayTimestamp(plan.created_at)
  const createdAtFrom = toDayTimestamp(filters.created_at_from)
  const createdAtTo = toDayTimestamp(filters.created_at_to)
  if (createdAtFrom !== null || createdAtTo !== null) {
    if (createdAt === null) {
      return false
    }

    if (createdAtFrom !== null && createdAt < createdAtFrom) {
      return false
    }

    if (createdAtTo !== null && createdAt > createdAtTo) {
      return false
    }
  }

  return true
}
