import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { addMonths, clampWeekStartsOn, startOfMonth } from '../domain/date.utils'
import { getCalendarDayKey } from '../domain/dayKey.utils'
import { buildMonthMatrix, type CalendarDay } from '../domain/monthMatrix.builder'
import { isSameMonth } from '../domain/comparison.utils'
import { normalizeToCalendarDay } from '../domain/normalize.utils'
import { isWithinRange, normalizeRange } from '../domain/range.utils'

import type {
  CalendarModel,
  CalendarRangeValue,
  CalendarSelectionMode,
  CalendarValue,
  UseCalendarModelProps,
} from './calendar.types'
import { selectByMode } from './selection.machine'
import { isDate, isMultipleValue, isRangeValue, validateCalendarValueForMode } from './validation.utils'

const DEV = import.meta.env.DEV

const EMPTY_RANGE: CalendarRangeValue = {
  start: null,
  end: null,
}

export const isSelectionValueControlled = (value: CalendarValue | undefined): boolean => {
  return value !== undefined
}

export const isVisibleMonthControlled = (visibleMonth: Date | undefined): boolean => {
  return visibleMonth !== undefined
}

export type VisibleMonthSyncAction = 'state' | 'callback' | 'noop'

export const resolveVisibleMonthSyncAction = ({
  isMonthControlled,
  hasOnVisibleMonthChange,
  currentVisibleMonth,
  nextVisibleMonth,
}: {
  isMonthControlled: boolean
  hasOnVisibleMonthChange: boolean
  currentVisibleMonth: Date
  nextVisibleMonth: Date
}): VisibleMonthSyncAction => {
  if (isSameMonth(currentVisibleMonth, nextVisibleMonth)) {
    return 'noop'
  }

  if (isMonthControlled) {
    return hasOnVisibleMonthChange ? 'callback' : 'noop'
  }

  return 'state'
}

export const shouldUseRangePreview = ({
  selectionMode,
  rangeValue,
  hoveredDate,
}: {
  selectionMode: CalendarSelectionMode
  rangeValue: CalendarRangeValue
  hoveredDate: Date | null
}): boolean => {
  if (selectionMode !== 'range') {
    return false
  }

  if (!rangeValue.start || rangeValue.end) {
    return false
  }

  if (!hoveredDate) {
    return false
  }

  return true
}

export const normalizeCalendarValue = (value: CalendarValue | undefined): CalendarValue | undefined => {
  if (value === undefined || value === null) {
    return value
  }

  if (isDate(value)) {
    return normalizeToCalendarDay(value)
  }

  if (isMultipleValue(value)) {
    return value.map((date) => normalizeToCalendarDay(date))
  }

  if (isRangeValue(value)) {
    return {
      start: value.start ? normalizeToCalendarDay(value.start) : null,
      end: value.end ? normalizeToCalendarDay(value.end) : null,
    }
  }

  return value
}

export const getEmptyValueForMode = (mode: CalendarSelectionMode): CalendarValue => {
  if (mode === 'multiple') {
    return []
  }

  if (mode === 'range') {
    return { start: null, end: null }
  }

  return null
}

const getRangeValue = (value: CalendarValue | undefined): CalendarRangeValue => {
  if (!isRangeValue(value)) {
    return EMPTY_RANGE
  }

  return {
    start: value.start ? normalizeToCalendarDay(value.start) : null,
    end: value.end ? normalizeToCalendarDay(value.end) : null,
  }
}

export const resolveValueAnchorDate = (
  mode: CalendarSelectionMode,
  value: CalendarValue | undefined,
): Date | null => {
  const normalizedValue = normalizeCalendarValue(value)

  if (mode === 'range') {
    const range = getRangeValue(normalizedValue)
    return range.start
  }

  if (mode === 'multiple') {
    if (isMultipleValue(normalizedValue) && normalizedValue.length > 0) {
      return normalizeToCalendarDay(normalizedValue[0])
    }
    return null
  }

  if (mode === 'single') {
    if (isDate(normalizedValue)) {
      return normalizeToCalendarDay(normalizedValue)
    }
    return null
  }

  if (isDate(normalizedValue)) {
    return normalizeToCalendarDay(normalizedValue)
  }

  if (isMultipleValue(normalizedValue) && normalizedValue.length > 0) {
    return normalizeToCalendarDay(normalizedValue[0])
  }

  const readonlyRange = getRangeValue(normalizedValue)
  if (readonlyRange.start) {
    return readonlyRange.start
  }

  return null
}

export const resolveAnchorDateWithFallback = (
  mode: CalendarSelectionMode,
  value: CalendarValue | undefined,
  fallbackDate: Date,
): Date => {
  const anchor = resolveValueAnchorDate(mode, value)
  return anchor ? normalizeToCalendarDay(anchor) : normalizeToCalendarDay(fallbackDate)
}

const getFirstDayOfVisibleMonth = (daysMatrix: CalendarDay[], visibleMonth: Date): Date => {
  const firstCurrentMonthDay = daysMatrix.find((day) =>
    day.date.getFullYear() === visibleMonth.getFullYear() && day.date.getMonth() === visibleMonth.getMonth(),
  )

  return firstCurrentMonthDay ? firstCurrentMonthDay.date : daysMatrix[0].date
}

export const resolveFocusDayKey = ({
  selectionMode,
  value,
  visibleMonth,
  today,
  flatDays,
}: {
  selectionMode: CalendarSelectionMode
  value: CalendarValue | undefined
  visibleMonth: Date
  today: Date
  flatDays: CalendarDay[]
}): string => {
  const fallbackDay = getFirstDayOfVisibleMonth(flatDays, visibleMonth)
  const anchor = resolveValueAnchorDate(selectionMode, value)

  let candidate = fallbackDay

  if (anchor) {
    candidate = anchor
  } else if (isSameMonth(today, visibleMonth)) {
    candidate = today
  }

  const candidateKey = getCalendarDayKey(candidate)
  const keys = new Set(flatDays.map((day) => getCalendarDayKey(day.date)))

  if (keys.has(candidateKey)) {
    return candidateKey
  }

  return getCalendarDayKey(fallbackDay)
}

const getSelectionKeys = (value: CalendarValue): Set<string> => {
  if (isDate(value)) {
    return new Set([getCalendarDayKey(value)])
  }

  if (isMultipleValue(value)) {
    return new Set(value.map((entry) => getCalendarDayKey(entry)))
  }

  if (isRangeValue(value)) {
    const keys = new Set<string>()
    if (value.start) {
      keys.add(getCalendarDayKey(value.start))
    }
    if (value.end) {
      keys.add(getCalendarDayKey(value.end))
    }
    return keys
  }

  return new Set()
}

export const useCalendarModel = (props: UseCalendarModelProps = {}): CalendarModel => {
  const selectionMode = props.selectionMode ?? 'single'
  const weekStartsOn = clampWeekStartsOn(props.weekStartsOn ?? 1)
  const today = useMemo(() => normalizeToCalendarDay(new Date()), [])

  const isSelectionControlled = isSelectionValueControlled(props.value)
  const isMonthControlled = isVisibleMonthControlled(props.visibleMonth)

  const initialSelectionSeed =
    props.defaultValue === undefined ? getEmptyValueForMode(selectionMode) : props.defaultValue
  const normalizedInitialSelection = normalizeCalendarValue(initialSelectionSeed)
  const initialSelection =
    normalizedInitialSelection === undefined
      ? getEmptyValueForMode(selectionMode)
      : normalizedInitialSelection

  const [internalSelection, setInternalSelection] = useState<CalendarValue>(initialSelection)
  const [hoveredDate, setHoveredDateState] = useState<Date | null>(null)
  const [lastInteractionDayKey, setLastInteractionDayKey] = useState<string | null>(null)

  const initialVisibleMonth = useMemo(() => {
    if (isMonthControlled && props.visibleMonth) {
      return startOfMonth(normalizeToCalendarDay(props.visibleMonth))
    }

    const seedValue = isSelectionControlled ? props.value : props.defaultValue
    const anchor = resolveAnchorDateWithFallback(selectionMode, seedValue, today)
    return startOfMonth(anchor)
  }, [
    isMonthControlled,
    props.visibleMonth,
    isSelectionControlled,
    props.value,
    props.defaultValue,
    selectionMode,
    today,
  ])

  const [internalVisibleMonth, setInternalVisibleMonth] = useState<Date>(initialVisibleMonth)

  const normalizedSelectedValue = normalizeCalendarValue(
    isSelectionControlled ? props.value : internalSelection,
  )
  const selectedValue = normalizedSelectedValue === undefined ? getEmptyValueForMode(selectionMode) : normalizedSelectedValue
  const latestSelectionRef = useRef<CalendarValue>(selectedValue)

  useEffect(() => {
    latestSelectionRef.current = selectedValue
  }, [selectedValue])

  const visibleMonth = useMemo(() => {
    if (isMonthControlled && props.visibleMonth) {
      return startOfMonth(normalizeToCalendarDay(props.visibleMonth))
    }

    return internalVisibleMonth
  }, [isMonthControlled, props.visibleMonth, internalVisibleMonth])

  const daysMatrix = useMemo(() => {
    return buildMonthMatrix({
      year: visibleMonth.getFullYear(),
      month: visibleMonth.getMonth(),
      weekStartsOn,
    })
  }, [visibleMonth, weekStartsOn])

  const flatDays = useMemo(() => daysMatrix.flat(), [daysMatrix])

  const focusDayKey = useMemo(() => {
    if (lastInteractionDayKey) {
      const hasInteractionKey = flatDays.some(
        (day) => getCalendarDayKey(day.date) === lastInteractionDayKey,
      )
      if (hasInteractionKey) {
        return lastInteractionDayKey
      }
    }

    return resolveFocusDayKey({
      selectionMode,
      value: selectedValue,
      visibleMonth,
      today,
      flatDays,
    })
  }, [lastInteractionDayKey, selectionMode, selectedValue, visibleMonth, today, flatDays])

  const hasLoggedInvalidControlledMonthRef = useRef(false)

  useEffect(() => {
    if (!DEV) {
      return
    }

    if (isMonthControlled && !props.onVisibleMonthChange && !hasLoggedInvalidControlledMonthRef.current) {
      console.warn(
        '[shared/calendar] visibleMonth is controlled but onVisibleMonthChange is missing. Navigation is disabled in controlled month mode without callback.',
      )
      hasLoggedInvalidControlledMonthRef.current = true
    }
  }, [isMonthControlled, props.onVisibleMonthChange])

  const valueValidation = useMemo(() => {
    const valueToValidate = isSelectionControlled ? props.value : internalSelection
    return validateCalendarValueForMode(selectionMode, valueToValidate)
  }, [isSelectionControlled, props.value, internalSelection, selectionMode])

  useEffect(() => {
    if (!DEV || valueValidation.isValid) {
      return
    }

    console.warn(
      `[shared/calendar] selectionMode/value mismatch. Mode "${selectionMode}" expects ${valueValidation.expected}, received ${valueValidation.actual}.`,
    )
  }, [selectionMode, valueValidation])

  const syncVisibleMonth = useCallback(
    (nextMonthDate: Date) => {
      const normalizedNextMonth = startOfMonth(normalizeToCalendarDay(nextMonthDate))
      const action = resolveVisibleMonthSyncAction({
        isMonthControlled,
        hasOnVisibleMonthChange: Boolean(props.onVisibleMonthChange),
        currentVisibleMonth: visibleMonth,
        nextVisibleMonth: normalizedNextMonth,
      })

      if (action === 'callback' && props.onVisibleMonthChange) {
        props.onVisibleMonthChange(normalizedNextMonth)
        return
      }

      if (action === 'state') {
        setInternalVisibleMonth(normalizedNextMonth)
      }
    },
    [isMonthControlled, props.onVisibleMonthChange, visibleMonth],
  )

  useEffect(() => {
    if (!isSelectionControlled) {
      return
    }

    const anchor = resolveAnchorDateWithFallback(selectionMode, props.value, today)
    const anchorMonth = startOfMonth(anchor)
    const action = resolveVisibleMonthSyncAction({
      isMonthControlled,
      hasOnVisibleMonthChange: Boolean(props.onVisibleMonthChange),
      currentVisibleMonth: visibleMonth,
      nextVisibleMonth: anchorMonth,
    })

    if (action === 'callback' && props.onVisibleMonthChange) {
      props.onVisibleMonthChange(anchorMonth)
      return
    }

    if (action === 'state') {
      setInternalVisibleMonth(anchorMonth)
    }
  }, [
    isSelectionControlled,
    selectionMode,
    props.value,
    today,
    isMonthControlled,
    props.onVisibleMonthChange,
  ])

  const selectedKeys = useMemo(() => getSelectionKeys(selectedValue), [selectedValue])

  const rangeValue = useMemo(() => getRangeValue(selectedValue), [selectedValue])

  const isRangeSelectionInProgress =
    selectionMode === 'range' && rangeValue.start !== null && rangeValue.end === null

  useEffect(() => {
    if (!isRangeSelectionInProgress && hoveredDate !== null) {
      setHoveredDateState(null)
    }
  }, [hoveredDate, isRangeSelectionInProgress])

  const setHoveredDate = useCallback(
    (date: Date | null) => {
      if (selectionMode !== 'range') {
        return
      }

      if (!isRangeSelectionInProgress) {
        if (hoveredDate !== null) {
          setHoveredDateState(null)
        }
        return
      }

      setHoveredDateState(date ? normalizeToCalendarDay(date) : null)
    },
    [selectionMode, isRangeSelectionInProgress, hoveredDate],
  )

  const isSelected = useCallback(
    (date: Date): boolean => {
      const normalizedDate = normalizeToCalendarDay(date)
      return selectedKeys.has(getCalendarDayKey(normalizedDate))
    },
    [selectedKeys],
  )

  const isInRange = useCallback(
    (date: Date): boolean => {
      const normalizedDate = normalizeToCalendarDay(date)

      if (rangeValue.start && rangeValue.end) {
        return isWithinRange(normalizedDate, rangeValue.start, rangeValue.end)
      }

      if (
        !shouldUseRangePreview({
          selectionMode,
          rangeValue,
          hoveredDate,
        })
      ) {
        return false
      }

      const previewStart = rangeValue.start
      const previewEnd = hoveredDate

      if (!previewStart || !previewEnd) {
        return false
      }

      const preview = normalizeRange(previewStart, previewEnd)
      return isWithinRange(normalizedDate, preview.start, preview.end)
    },
    [rangeValue, selectionMode, isSelectionControlled, hoveredDate],
  )

  const selectDate = useCallback(
    (date: Date) => {
      if (selectionMode === 'readonly') {
        return
      }

      const normalizedDate = normalizeToCalendarDay(date)
      const nextDayKey = getCalendarDayKey(normalizedDate)
      setLastInteractionDayKey(nextDayKey)
      const currentSelection = isSelectionControlled
        ? latestSelectionRef.current
        : selectedValue
      const nextValue = selectByMode(selectionMode, currentSelection, normalizedDate)

      if (isSelectionControlled) {
        const normalizedNextValue = normalizeCalendarValue(nextValue)
        latestSelectionRef.current =
          normalizedNextValue === undefined
            ? getEmptyValueForMode(selectionMode)
            : normalizedNextValue
        props.onChange?.(nextValue)
      } else {
        setInternalSelection(nextValue)
      }

      setHoveredDateState(null)
      syncVisibleMonth(normalizedDate)
    },
    [selectionMode, selectedValue, isSelectionControlled, props.onChange, syncVisibleMonth],
  )

  const nextMonth = useCallback(() => {
    syncVisibleMonth(addMonths(visibleMonth, 1))
  }, [syncVisibleMonth, visibleMonth])

  const prevMonth = useCallback(() => {
    syncVisibleMonth(addMonths(visibleMonth, -1))
  }, [syncVisibleMonth, visibleMonth])

  const goToToday = useCallback(() => {
    syncVisibleMonth(today)
  }, [syncVisibleMonth, today])

  return {
    visibleMonth,
    daysMatrix,
    selectionMode,
    focusDayKey,
    isRangeSelectionInProgress,
    selectDate,
    nextMonth,
    prevMonth,
    goToToday,
    setHoveredDate,
    isSelected,
    isInRange,
  }
}
