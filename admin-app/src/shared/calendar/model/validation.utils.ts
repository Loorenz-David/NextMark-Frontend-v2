import type {
  CalendarRangeValue,
  CalendarSelectionMode,
  CalendarValidationResult,
  CalendarValue,
} from './calendar.types'

const isDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime())

const isRangeValue = (value: unknown): value is CalendarRangeValue => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybeRange = value as Record<string, unknown>
  const hasStart = 'start' in maybeRange
  const hasEnd = 'end' in maybeRange

  if (!hasStart || !hasEnd) {
    return false
  }

  const start = maybeRange.start
  const end = maybeRange.end

  const startValid = start === null || isDate(start)
  const endValid = end === null || isDate(end)

  return startValid && endValid
}

const isMultipleValue = (value: unknown): value is Date[] => {
  if (!Array.isArray(value)) {
    return false
  }

  return value.every((entry) => isDate(entry))
}

export const describeCalendarValueShape = (value: CalendarValue | undefined): string => {
  if (value === undefined) {
    return 'undefined'
  }

  if (value === null) {
    return 'null'
  }

  if (isDate(value)) {
    return 'Date'
  }

  if (isMultipleValue(value)) {
    return 'Date[]'
  }

  if (isRangeValue(value)) {
    return '{ start: Date | null; end: Date | null }'
  }

  return typeof value
}

const isAnyKnownCalendarShape = (value: CalendarValue | undefined): boolean => {
  if (value === undefined || value === null) {
    return true
  }

  if (isDate(value) || isMultipleValue(value) || isRangeValue(value)) {
    return true
  }

  return false
}

const validationSuccess = (expected: string, actual: string): CalendarValidationResult => ({
  isValid: true,
  expected,
  actual,
})

const validationFailure = (expected: string, actual: string): CalendarValidationResult => ({
  isValid: false,
  expected,
  actual,
})

export const validateCalendarValueForMode = (
  mode: CalendarSelectionMode,
  value: CalendarValue | undefined,
): CalendarValidationResult => {
  const actual = describeCalendarValueShape(value)

  if (value === undefined) {
    return validationSuccess('uncontrolled', actual)
  }

  if (mode === 'single') {
    return value === null || isDate(value)
      ? validationSuccess('Date | null', actual)
      : validationFailure('Date | null', actual)
  }

  if (mode === 'multiple') {
    return isMultipleValue(value)
      ? validationSuccess('Date[]', actual)
      : validationFailure('Date[]', actual)
  }

  if (mode === 'range') {
    return isRangeValue(value)
      ? validationSuccess('{ start: Date | null; end: Date | null }', actual)
      : validationFailure('{ start: Date | null; end: Date | null }', actual)
  }

  return isAnyKnownCalendarShape(value)
    ? validationSuccess('Date | Date[] | { start; end } | null', actual)
    : validationFailure('Date | Date[] | { start; end } | null', actual)
}

export { isDate, isRangeValue, isMultipleValue }
