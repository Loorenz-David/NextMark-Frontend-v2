import { isAfter, isBefore } from './comparison.utils'
import { normalizeToCalendarDay } from './normalize.utils'

export type CalendarRange = {
  start: Date | null
  end: Date | null
}

export const normalizeRange = (a: Date, b: Date): { start: Date; end: Date } => {
  const first = normalizeToCalendarDay(a)
  const second = normalizeToCalendarDay(b)

  if (isAfter(first, second)) {
    return { start: second, end: first }
  }

  return { start: first, end: second }
}

export const isWithinRange = (date: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) {
    return false
  }

  const normalizedDate = normalizeToCalendarDay(date)
  const normalizedStart = normalizeToCalendarDay(start)
  const normalizedEnd = normalizeToCalendarDay(end)

  if (isBefore(normalizedDate, normalizedStart)) {
    return false
  }

  if (isAfter(normalizedDate, normalizedEnd)) {
    return false
  }

  return true
}

export const isRangeComplete = (range: CalendarRange): boolean => {
  return range.start !== null && range.end !== null
}
