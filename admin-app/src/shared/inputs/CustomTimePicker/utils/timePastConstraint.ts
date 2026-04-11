import { formatDateOnlyInTimeZone } from '@/shared/utils/formatIsoDate'
import { getTeamTimeZone } from '@/shared/utils/teamTimeZone'

import type { TimeValue } from '../types'
import { normalizeTimeValue } from './timeClamp'

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

type TimePastConstraint =
  | { mode: 'none' }
  | { mode: 'disabled-all'; minimumTime: TimeValue }
  | { mode: 'today'; minimumTime: TimeValue }

const resolveComparisonDateKey = (
  value: Date | string | null | undefined,
  timeZone: string,
) => {
  if (!value) {
    return null
  }

  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value.trim())) {
    return value.trim()
  }

  return formatDateOnlyInTimeZone(value, timeZone)
}

export const resolveCurrentTeamTimeValue = (
  minuteStep: number,
  referenceDate: Date = new Date(),
  timeZone = getTeamTimeZone(),
): TimeValue => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(referenceDate)

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')

  return normalizeTimeValue({ hour, minute }, minuteStep)
}

export const resolveTimePastConstraint = ({
  comparisonDate,
  minuteStep,
  timeZone = getTeamTimeZone(),
}: {
  comparisonDate?: Date | string | null
  minuteStep: number
  timeZone?: string
}): TimePastConstraint => {
  const comparisonDateKey = resolveComparisonDateKey(comparisonDate, timeZone)
  if (!comparisonDateKey) {
    return { mode: 'none' }
  }

  const todayKey = formatDateOnlyInTimeZone(new Date(), timeZone)
  if (!todayKey) {
    return { mode: 'none' }
  }

  const minimumTime = resolveCurrentTeamTimeValue(minuteStep, new Date(), timeZone)

  if (comparisonDateKey < todayKey) {
    return { mode: 'disabled-all', minimumTime }
  }

  if (comparisonDateKey > todayKey) {
    return { mode: 'none' }
  }

  return {
    mode: 'today',
    minimumTime,
  }
}

export const isTimeValueAllowedByConstraint = (
  value: TimeValue,
  constraint: TimePastConstraint,
) => {
  if (constraint.mode === 'none') {
    return true
  }

  const currentTotal = value.hour * 60 + value.minute
  const minimumTotal = constraint.minimumTime.hour * 60 + constraint.minimumTime.minute

  return currentTotal >= minimumTotal
}
