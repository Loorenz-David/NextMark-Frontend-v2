import { getCalendarDayKey } from '../domain/dayKey.utils'
import { isSameDay } from '../domain/comparison.utils'
import { normalizeToCalendarDay } from '../domain/normalize.utils'
import { normalizeRange } from '../domain/range.utils'

import type {
  CalendarRangeValue,
  CalendarSelectionMode,
  CalendarValue,
} from './calendar.types'
import { isDate, isMultipleValue, isRangeValue } from './validation.utils'

const EMPTY_RANGE: CalendarRangeValue = { start: null, end: null }

const normalizeRangeValue = (value: CalendarValue): CalendarRangeValue => {
  if (isRangeValue(value)) {
    return {
      start: value.start ? normalizeToCalendarDay(value.start) : null,
      end: value.end ? normalizeToCalendarDay(value.end) : null,
    }
  }

  return EMPTY_RANGE
}

export const selectSingle = (current: CalendarValue, selectedDate: Date): CalendarValue => {
  const normalizedSelected = normalizeToCalendarDay(selectedDate)

  if (isDate(current)) {
    const normalizedCurrent = normalizeToCalendarDay(current)

    if (isSameDay(normalizedCurrent, normalizedSelected)) {
      if (current.getTime() === normalizedCurrent.getTime()) {
        return current
      }

      return normalizedCurrent
    }
  }

  return normalizedSelected
}

export const selectMultiple = (current: CalendarValue, selectedDate: Date): CalendarValue => {
  const normalizedSelected = normalizeToCalendarDay(selectedDate)
  const selectedKey = getCalendarDayKey(normalizedSelected)
  const currentValues = isMultipleValue(current)
    ? current.map((date) => normalizeToCalendarDay(date))
    : []

  const existingIndex = currentValues.findIndex((date) => getCalendarDayKey(date) === selectedKey)

  if (existingIndex >= 0) {
    return currentValues.filter((_, index) => index !== existingIndex)
  }

  return [...currentValues, normalizedSelected]
}

export const selectRange = (current: CalendarValue, selectedDate: Date): CalendarValue => {
  const normalizedSelected = normalizeToCalendarDay(selectedDate)
  const range = normalizeRangeValue(current)

  if (!range.start) {
    return {
      start: normalizedSelected,
      end: null,
    }
  }

  if (!range.end) {
    if (isSameDay(range.start, normalizedSelected)) {
      return {
        start: range.start,
        end: range.start,
      }
    }

    const normalized = normalizeRange(range.start, normalizedSelected)

    return {
      start: normalized.start,
      end: normalized.end,
    }
  }

  return {
    start: normalizedSelected,
    end: null,
  }
}

export const selectByMode = (
  mode: CalendarSelectionMode,
  current: CalendarValue,
  selectedDate: Date,
): CalendarValue => {
  if (mode === 'readonly') {
    return current
  }

  if (mode === 'single') {
    return selectSingle(current, selectedDate)
  }

  if (mode === 'multiple') {
    return selectMultiple(current, selectedDate)
  }

  return selectRange(current, selectedDate)
}
