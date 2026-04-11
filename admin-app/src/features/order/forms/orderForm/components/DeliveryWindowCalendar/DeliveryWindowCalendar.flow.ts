import type { CostumerOperatingHours } from '@/features/costumer'
import {
  getCalendarDayKey,
  type CalendarRangeValue,
  type CalendarValue,
} from '@/shared/calendar'

import {
  resolveOperatingDayAvailability,
  type DeliveryWindowDisplayRow,
} from '../../flows/orderFormDeliveryWindows.flow'
import type { DeliveryWindowCalendarMode } from './DeliveryWindowCalendar.types'

const isDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime())

const toDateInputValue = (value: Date | null) => {
  if (!value) return null
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const resolveCalendarSelectionToBoundaryValues = ({
  mode,
  nextValue,
}: {
  mode: DeliveryWindowCalendarMode
  nextValue: CalendarValue
}) => {
  if (mode === 'single') {
    const date = isDate(nextValue) ? nextValue : null
    const nextBoundary = toDateInputValue(date)
    return { earliest: nextBoundary, latest: nextBoundary }
  }

  if (mode === 'multiple') {
    const dates = Array.isArray(nextValue) ? nextValue.filter(isDate) : []
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime())
    return {
      earliest: toDateInputValue(sorted[0] ?? null),
      latest: toDateInputValue(sorted.at(-1) ?? null),
    }
  }

  const rangeCandidate =
    nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue) && 'start' in nextValue
      ? (nextValue as CalendarRangeValue)
      : { start: null, end: null }

  return {
    earliest: toDateInputValue(rangeCandidate.start),
    latest: toDateInputValue(rangeCandidate.end),
  }
}

export const formatSelectionRange = (range: CalendarRangeValue) => {
  const startLabel = range.start ? getCalendarDayKey(range.start) : 'not set'
  const endLabel = range.end ? getCalendarDayKey(range.end) : 'not set'
  return `${startLabel} -> ${endLabel}`
}

export const resolveDefaultTimesForSelection = ({
  localDates,
  operatingHours,
  existingRows = [],
}: {
  localDates: string[]
  operatingHours: CostumerOperatingHours[]
  existingRows?: DeliveryWindowDisplayRow[]
}) => {
  if (!localDates.length) {
    return { startTime: null as string | null, endTime: null as string | null }
  }

  const slots = localDates
    .map((localDate) => resolveOperatingDayAvailability({ localDate, operatingHours }))
    .filter((slot) => slot.selectable)

  if (!slots.length) {
    return { startTime: null, endTime: null }
  }

  const sameBounds = slots.every(
    (slot) => slot.openTime === slots[0]?.openTime && slot.closeTime === slots[0]?.closeTime,
  )
  if (!sameBounds) {
    return { startTime: null, endTime: null }
  }

  const selectedDateSet = new Set(localDates)
  const nextStarts = existingRows
    .filter((row) => selectedDateSet.has(row.date))
    .map((row) => addOneMinute(row.end))
    .filter((value): value is string => value !== null)

  const latestNextStart = nextStarts.length
    ? nextStarts.reduce((latest, current) => (current > latest ? current : latest))
    : null

  const slotStart = slots[0]?.openTime ?? null
  const slotEnd = slots[0]?.closeTime ?? null
  const resolvedStart =
    latestNextStart && isBetweenInclusive(latestNextStart, slotStart, slotEnd)
      ? latestNextStart
      : slotStart

  return {
    startTime: resolvedStart,
    endTime: slotEnd,
  }
}

export const isDeliveryWindowSelectionInProgress = ({
  mode,
  selectionValue,
  isEditorOpen,
}: {
  mode: DeliveryWindowCalendarMode
  selectionValue: CalendarValue
  isEditorOpen: boolean
}) => {
  if (isEditorOpen) {
    return false
  }

  if (mode === 'range') {
    const candidate =
      selectionValue &&
      typeof selectionValue === 'object' &&
      !Array.isArray(selectionValue) &&
      'start' in selectionValue
        ? (selectionValue as CalendarRangeValue)
        : null
    return Boolean(candidate?.start && !candidate?.end)
  }

  if (mode === 'multiple') {
    return false
  }

  return false
}

const addOneMinute = (hhmm: string): string | null => {
  const parsed = parseHHmm(hhmm)
  if (!parsed) {
    return null
  }
  const total = parsed.hour * 60 + parsed.minute + 1
  if (total > 23 * 60 + 59) {
    return null
  }
  const hour = Math.floor(total / 60)
  const minute = total % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const parseHHmm = (value: string): { hour: number; minute: number } | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) {
    return null
  }
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }
  return { hour, minute }
}

const isBetweenInclusive = (
  value: string,
  minimum: string | null,
  maximum: string | null,
) => {
  if (!minimum || !maximum) {
    return true
  }
  return value >= minimum && value <= maximum
}
