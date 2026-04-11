import type { Order } from '../types/order'
import type { OrderQueryFilters } from '../types/orderMeta'

type ReactiveOrderVisibilityContext = {
  orderStateNameById?: Record<number, string>
  routePlanDateRangeById?: Record<number, { startDate: string | null; endDate: string | null }>
}

const resolveOrderPlanId = (order: Order): number | null => {
  if (typeof order.delivery_plan_id === 'number' && Number.isFinite(order.delivery_plan_id)) {
    return order.delivery_plan_id
  }

  return null
}

const normalizePlanIdFilters = (value: OrderQueryFilters['plan_id']): number[] => {
  if (value == null) return []
  const values = Array.isArray(value) ? value : [value]
  return values
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
}

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

export const reactiveOrderVisibility = (
  order: Order,
  filters: OrderQueryFilters,
  context: ReactiveOrderVisibilityContext = {},
): boolean => {
  if (!order) return false
  const isArchived = order.archive_at != null
  const orderPlanId = resolveOrderPlanId(order)

  // unscheduled orders
  if (filters.unschedule_order && orderPlanId != null) {
    return false
  }

  // scheduled orders
  if (filters.schedule_order && orderPlanId == null) {
    return false
  }

  // archived visibility (mirror backend find_orders semantics)
  if (filters.show_archived === true) {
    if (!isArchived) {
      return false
    }
  } else if (isArchived) {
    return false
  }

  // order state filtering
  if (filters.order_state_id != null) {
    const stateFilter = filters.order_state_id
    if (Array.isArray(stateFilter)) {
      if (!stateFilter.includes(order.order_state_id ?? -1)) {
        return false
      }
    } else {
      if (order.order_state_id !== stateFilter) {
        return false
      }
    }
  }

  if (filters.order_state != null) {
    const stateFilters = Array.isArray(filters.order_state)
      ? filters.order_state
      : [filters.order_state]
    const normalizedStateFilters = stateFilters
      .map((value) => String(value).trim())
      .filter(Boolean)

    if (normalizedStateFilters.length === 0) {
      return false
    }

    const orderStateName = typeof order.order_state_id === 'number'
      ? context.orderStateNameById?.[order.order_state_id] ?? null
      : null

    if (!orderStateName || !normalizedStateFilters.includes(orderStateName)) {
      return false
    }
  }

  // plan id filtering
  if (filters.plan_id != null) {
    const planIds = normalizePlanIdFilters(filters.plan_id)
    if (!planIds.length) {
      return false
    }

    if (orderPlanId == null) {
      return false
    }

    if (!planIds.includes(orderPlanId)) {
      return false
    }
  }

  const scheduleFrom = toDayTimestamp(filters.order_schedule_from)
  const scheduleTo = toDayTimestamp(filters.order_schedule_to)
  if (scheduleFrom !== null || scheduleTo !== null) {
    if (orderPlanId == null) {
      return false
    }

    const routePlanRange = context.routePlanDateRangeById?.[orderPlanId]
    const planStart = toDayTimestamp(routePlanRange?.startDate)
    const planEnd = toDayTimestamp(routePlanRange?.endDate)
    const normalizedPlanStart = planStart ?? planEnd
    const normalizedPlanEnd = planEnd ?? planStart

    if (normalizedPlanStart === null || normalizedPlanEnd === null) {
      return false
    }

    if (scheduleFrom !== null && normalizedPlanEnd < scheduleFrom) {
      return false
    }

    if (scheduleTo !== null && normalizedPlanStart > scheduleTo) {
      return false
    }
  }

  return true
}
