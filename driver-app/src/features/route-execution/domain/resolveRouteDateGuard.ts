import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import { formatRouteDateRange } from '@/features/routes/domain/formatRouteDateRange'

export type RouteDateGuardResult =
  | { kind: 'allowed' }
  | {
      kind: 'requires_adjustment'
      title: string
      message: string
    }

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toLocalDayStamp(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

export function resolveRouteDateGuard(route: AssignedRouteViewModel | null): RouteDateGuardResult {
  const startDate = parseDate(route?.deliveryPlanStartDate)
  const endDate = parseDate(route?.deliveryPlanEndDate)

  if (!startDate && !endDate) {
    return { kind: 'allowed' }
  }

  const todayStamp = toLocalDayStamp(new Date())
  const startStamp = startDate ? toLocalDayStamp(startDate) : null
  const endStamp = endDate ? toLocalDayStamp(endDate) : null

  const isWithinRange = (
    (startStamp == null || todayStamp >= startStamp)
    && (endStamp == null || todayStamp <= endStamp)
  )

  if (isWithinRange) {
    return { kind: 'allowed' }
  }

  const dateRangeLabel = formatRouteDateRange({
    startDate: route?.deliveryPlanStartDate ?? null,
    endDate: route?.deliveryPlanEndDate ?? null,
  })

  return {
    kind: 'requires_adjustment',
    title: 'Route date mismatch',
    message: `Route is set for dates ${dateRangeLabel}. Adjust dates to today before continuing.`,
  }
}
