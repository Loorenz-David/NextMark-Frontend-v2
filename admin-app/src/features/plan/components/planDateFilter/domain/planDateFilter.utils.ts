import type { PlanQueryFilters } from '@/features/plan/types/planMeta'
import { formatDateIso, normalizeToDay } from '@/shared/inputs/CustomDatePicker/model/customDatePicker.utils'

import type { PlanDateFilterMode } from './planDateFilter.types'

const addDays = (date: Date, step: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + step)
  return normalizeToDay(next)
}

const addMonths = (date: Date, step: number) => {
  const normalized = normalizeToDay(date)
  return normalizeToDay(
    new Date(normalized.getFullYear(), normalized.getMonth() + step, 1),
  )
}

const getMonthBounds = (date: Date) => {
  const normalized = normalizeToDay(date)
  const monthStart = new Date(normalized.getFullYear(), normalized.getMonth(), 1)
  const monthEnd = new Date(normalized.getFullYear(), normalized.getMonth() + 1, 0)
  return {
    start: normalizeToDay(monthStart),
    end: normalizeToDay(monthEnd),
  }
}

export const shiftSingleValueByMode = (
  mode: PlanDateFilterMode,
  anchorDate: Date,
  direction: 'prev' | 'next',
) => {
  const step = direction === 'next' ? 1 : -1
  if (mode === 'month') return addMonths(anchorDate, step)
  return addDays(anchorDate, step)
}

export const normalizeRange = (start: Date, end: Date) => {
  const normalizedStart = normalizeToDay(start)
  const normalizedEnd = normalizeToDay(end)

  if (normalizedStart.getTime() <= normalizedEnd.getTime()) {
    return { start: normalizedStart, end: normalizedEnd }
  }

  return { start: normalizedEnd, end: normalizedStart }
}

export const formatMonthLabel = (value: Date) => {
  return value.toLocaleDateString(undefined, {
    month: 'long',
  })
}

export const formatDayLabel = (value: Date) => {
  return value.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export const buildPlanFiltersFromSelection = ({
  mode,
  singleDate,
  rangeStart,
  rangeEnd,
}: {
  mode: PlanDateFilterMode
  singleDate: Date
  rangeStart: Date
  rangeEnd: Date
}): PlanQueryFilters => {
  if (mode === 'month') {
    const monthBounds = getMonthBounds(singleDate)
    return {
      start_date: formatDateIso(monthBounds.start),
      end_date: formatDateIso(monthBounds.end),
    }
  }

  if (mode === 'date') {
    const isoDate = formatDateIso(singleDate)
    return {
      start_date: isoDate,
      end_date: isoDate,
    }
  }

  const normalizedRange = normalizeRange(rangeStart, rangeEnd)
  return {
    start_date: formatDateIso(normalizedRange.start),
    end_date: formatDateIso(normalizedRange.end),
  }
}
