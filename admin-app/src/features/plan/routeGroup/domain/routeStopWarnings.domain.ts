import type { RouteSolutionStop } from '../types/routeSolutionStop'

type ConstraintWarning = {
  type?: string
  message?: string
  expected_time?: string
  allowed_start?: string
  allowed_end?: string
}

const normalizeWarningText = (value?: string | null) => value?.toLowerCase().trim() ?? ''

const isTimeWindowConstraintWarning = (warning: Record<string, unknown>) => {
  const payload = warning as ConstraintWarning
  const type = normalizeWarningText(payload.type)
  const message = normalizeWarningText(payload.message)

  if (payload.expected_time || payload.allowed_start || payload.allowed_end) {
    return true
  }

  return (
    type.includes('time')
    || type.includes('window')
    || message.includes('time')
    || message.includes('window')
    || message.includes('late')
    || message.includes('early')
  )
}

export const hasRouteStopWarnings = (stop?: RouteSolutionStop | null) =>
  Boolean(stop?.reason_was_skipped)
  || Boolean(stop?.has_constraint_violation)
  || (Array.isArray(stop?.constraint_warnings) && stop.constraint_warnings.length > 0)

export const hasRouteStopTimeWindowWarning = (stop?: RouteSolutionStop | null) => {
  const constraintWarnings = Array.isArray(stop?.constraint_warnings) ? stop.constraint_warnings : []
  return constraintWarnings.some(isTimeWindowConstraintWarning)
}
