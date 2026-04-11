import type { CalendarRangeValue } from '@/shared/calendar'
import { formatDateOnlyInTimeZone } from '@/shared/utils/formatIsoDate'
import { getTeamTimeZone } from '@/shared/utils/teamTimeZone'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const ISO_COMPACT_PATTERN = /^\d{8}$/

export const DATE_PLACEHOLDER = 'yy - mm - dd'

export const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export const normalizeToDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

export const formatDateIso = (date: Date): string => {
  const normalized = normalizeToDay(date)
  const year = normalized.getFullYear()
  const month = String(normalized.getMonth() + 1).padStart(2, '0')
  const day = String(normalized.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const normalizeInputForParsing = (value: string): string => {
  const trimmed = value.trim()

  if (ISO_COMPACT_PATTERN.test(trimmed)) {
    const year = trimmed.slice(0, 4)
    const month = trimmed.slice(4, 6)
    const day = trimmed.slice(6, 8)
    return `${year}-${month}-${day}`
  }

  return trimmed
}

export const parseIsoDate = (value: string): Date | null => {
  const normalizedInput = normalizeInputForParsing(value)

  if (!ISO_DATE_PATTERN.test(normalizedInput)) {
    return null
  }

  const [yearValue, monthValue, dayValue] = normalizedInput.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return normalizeToDay(date)
}

export const isSameDay = (left: Date | null, right: Date | null): boolean => {
  if (!left && !right) return true
  if (!left || !right) return false

  return normalizeToDay(left).getTime() === normalizeToDay(right).getTime()
}

export const isToday = (date: Date | null): boolean => {
  if (!date) return false

  return isSameDay(date, new Date())
}

export const isDateWithinRange = ({
  date,
  minDate,
  maxDate,
}: {
  date: Date
  minDate?: Date
  maxDate?: Date
}): boolean => {
  const normalizedDate = normalizeToDay(date)

  if (isValidDate(minDate)) {
    const normalizedMin = normalizeToDay(minDate)
    if (normalizedDate.getTime() < normalizedMin.getTime()) {
      return false
    }
  }

  if (isValidDate(maxDate)) {
    const normalizedMax = normalizeToDay(maxDate)
    if (normalizedDate.getTime() > normalizedMax.getTime()) {
      return false
    }
  }

  return true
}

export const resolveVisibleMonthAnchor = ({
  committedDate,
  minDate,
}: {
  committedDate: Date | null
  minDate?: Date
}): Date => {
  if (committedDate) {
    return normalizeToDay(committedDate)
  }

  if (isValidDate(minDate)) {
    return normalizeToDay(minDate)
  }

  return normalizeToDay(new Date())
}

export const resolveTodayInTeamTimeZone = (
  timeZone = getTeamTimeZone(),
): Date => {
  const today = formatDateOnlyInTimeZone(new Date(), timeZone)
  const parsed = today ? parseIsoDate(today) : null
  return parsed ?? normalizeToDay(new Date())
}

export const resolveEffectiveMinDate = ({
  minDate,
  disablePast,
}: {
  minDate?: Date
  disablePast?: boolean
}) => {
  if (!disablePast) {
    return minDate
  }

  const today = resolveTodayInTeamTimeZone()
  if (!isValidDate(minDate)) {
    return today
  }

  const normalizedMin = normalizeToDay(minDate)
  return normalizedMin.getTime() > today.getTime() ? normalizedMin : today
}

export const formatCommittedInput = (date: Date | null): string => {
  if (!date) return ''
  return formatDateIso(date)
}

export const formatCommittedRangeInput = (range: CalendarRangeValue): string => {
  if (!range.start && !range.end) return ''
  if (range.start && !range.end) return formatDateIso(range.start)
  if (!range.start && range.end) return formatDateIso(range.end)

  return `${formatDateIso(range.start as Date)} → ${formatDateIso(range.end as Date)}`
}
