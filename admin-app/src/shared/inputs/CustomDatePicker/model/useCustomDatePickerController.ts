import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'

import type {
  CalendarRangeValue,
  CalendarSelectionMode,
  CalendarValue,
} from '@/shared/calendar'

import type {
  CustomDatePickerController,
  CustomDatePickerMode,
  CustomDatePickerStrategy,
  UseCustomDatePickerControllerInput,
} from './customDatePicker.types'
import {
  formatCommittedInput,
  formatCommittedRangeInput,
  formatDateIso,
  isDateWithinRange,
  isSameDay,
  isValidDate,
  parseIsoDate,
  resolveVisibleMonthAnchor,
} from './customDatePicker.utils'

const EMPTY_RANGE: CalendarRangeValue = { start: null, end: null }

const resolveExternalDate = (value: Date | null | undefined): Date | null => {
  if (!isValidDate(value)) return null
  return value
}

const resolveExternalRange = (
  value: CalendarRangeValue | null | undefined,
): CalendarRangeValue => ({
  start: value?.start && isValidDate(value.start) ? value.start : null,
  end: value?.end && isValidDate(value.end) ? value.end : null,
})

const normalizeStrategy = (
  selectionMode: CustomDatePickerMode,
  strategy: CustomDatePickerStrategy | undefined,
): CustomDatePickerStrategy => {
  if (selectionMode === 'range') {
    return 'range'
  }

  if (selectionMode === 'single_or_range') {
    return strategy === 'range' ? 'range' : 'single'
  }

  return 'single'
}

const toCalendarSelectionMode = (
  selectionMode: CustomDatePickerMode,
  strategy: CustomDatePickerStrategy,
): CalendarSelectionMode =>
  selectionMode === 'range' || strategy === 'range' ? 'range' : 'single'

const buildDisplayValue = ({
  strategy,
  committedDate,
  committedRange,
}: {
  strategy: CustomDatePickerStrategy
  committedDate: Date | null
  committedRange: CalendarRangeValue
}) => {
  if (strategy === 'range') {
    return formatCommittedRangeInput(committedRange)
  }

  return formatCommittedInput(committedDate)
}

export const useCustomDatePickerController = ({
  selectionMode = 'single',
  strategy,
  date,
  rangeValue,
  onChange,
  onRangeChange,
  onStrategyChange,
  disabled,
  minDate,
  maxDate,
  open,
  onOpenChange,
  onCalendarSelect,
}: UseCustomDatePickerControllerInput): CustomDatePickerController => {
  const externalDate = useMemo(() => resolveExternalDate(date), [date])
  const externalRange = useMemo(() => resolveExternalRange(rangeValue), [rangeValue])
  const resolvedStrategy = useMemo(
    () => normalizeStrategy(selectionMode, strategy),
    [selectionMode, strategy],
  )
  const calendarSelectionMode = useMemo(
    () => toCalendarSelectionMode(selectionMode, resolvedStrategy),
    [resolvedStrategy, selectionMode],
  )

  const [committedDate, setCommittedDate] = useState<Date | null>(externalDate)
  const [committedRange, setCommittedRange] = useState<CalendarRangeValue>(externalRange)
  const [inputValue, setInputValue] = useState<string>(
    buildDisplayValue({
      strategy: resolvedStrategy,
      committedDate: externalDate,
      committedRange: externalRange,
    }),
  )
  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = isOpenControlled ? Boolean(open) : internalOpen
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    resolveVisibleMonthAnchor({
      committedDate:
        resolvedStrategy === 'range' ? externalRange.start ?? externalRange.end : externalDate,
      minDate,
    }),
  )

  useEffect(() => {
    if (isSameDay(externalDate, committedDate)) return
    setCommittedDate(externalDate)
  }, [committedDate, externalDate])

  useEffect(() => {
    const startChanged = !isSameDay(externalRange.start, committedRange.start)
    const endChanged = !isSameDay(externalRange.end, committedRange.end)

    if (!startChanged && !endChanged) return

    setCommittedRange(externalRange)
  }, [committedRange.end, committedRange.start, externalRange])

  useEffect(() => {
    setInputValue(
      buildDisplayValue({
        strategy: resolvedStrategy,
        committedDate: externalDate,
        committedRange: externalRange,
      }),
    )
  }, [externalDate, externalRange, resolvedStrategy])

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange],
  )

  const closePopover = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const openPopover = useCallback(() => {
    if (disabled) return

    setVisibleMonth(
      resolveVisibleMonthAnchor({
        committedDate:
          resolvedStrategy === 'range'
            ? committedRange.start ?? committedRange.end
            : committedDate,
        minDate,
      }),
    )
    setOpen(true)
  }, [committedDate, committedRange.end, committedRange.start, disabled, minDate, resolvedStrategy, setOpen])

  const revertToCommitted = useCallback(() => {
    setInputValue(
      buildDisplayValue({
        strategy: resolvedStrategy,
        committedDate,
        committedRange,
      }),
    )
  }, [committedDate, committedRange, resolvedStrategy])

  const commitDate = useCallback(
    (nextDate: Date | null) => {
      if (nextDate === null) {
        const hadValue = committedDate !== null
        setCommittedDate(null)
        setInputValue('')

        if (hadValue) {
          onChange?.(null)
        }
        return true
      }

      if (!isDateWithinRange({ date: nextDate, minDate, maxDate })) {
        return false
      }

      const hasChanged = !isSameDay(committedDate, nextDate)

      setCommittedDate(nextDate)
      setInputValue(formatDateIso(nextDate))

      if (hasChanged) {
        onChange?.(formatDateIso(nextDate))
      }

      return true
    },
    [committedDate, maxDate, minDate, onChange],
  )

  const commitRange = useCallback(
    (nextRange: CalendarRangeValue) => {
      const nextStart = nextRange.start
      const nextEnd = nextRange.end

      if (nextStart && !isDateWithinRange({ date: nextStart, minDate, maxDate })) {
        return false
      }

      if (nextEnd && !isDateWithinRange({ date: nextEnd, minDate, maxDate })) {
        return false
      }

      setCommittedRange(nextRange)
      setInputValue(formatCommittedRangeInput(nextRange))
      onRangeChange?.({
        start: nextStart ? formatDateIso(nextStart) : null,
        end: nextEnd ? formatDateIso(nextEnd) : null,
      })
      return true
    },
    [maxDate, minDate, onRangeChange],
  )

  const tryCommitFromInput = useCallback(() => {
    if (resolvedStrategy === 'range') {
      revertToCommitted()
      return
    }

    const trimmed = inputValue.trim()

    if (!trimmed) {
      commitDate(null)
      return
    }

    const parsed = parseIsoDate(trimmed)
    if (!parsed) {
      revertToCommitted()
      return
    }

    const committed = commitDate(parsed)
    if (!committed) {
      revertToCommitted()
    }
  }, [commitDate, inputValue, resolvedStrategy, revertToCommitted])

  const handleInputBlur = useCallback(() => {
    tryCommitFromInput()
  }, [tryCommitFromInput])

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openPopover()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        revertToCommitted()
        closePopover()
        return
      }

      if (resolvedStrategy === 'range') {
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        tryCommitFromInput()
        return
      }

      if (event.key === 'Tab') {
        tryCommitFromInput()
      }
    },
    [closePopover, disabled, openPopover, resolvedStrategy, revertToCommitted, tryCommitFromInput],
  )

  const handleInputChange = useCallback(
    (value: string) => {
      if (resolvedStrategy === 'range') {
        return
      }

      setInputValue(value)
    },
    [resolvedStrategy],
  )

  const handleStrategyChange = useCallback(
    (nextStrategy: CustomDatePickerStrategy) => {
      if (selectionMode !== 'single_or_range') {
        return
      }

      onStrategyChange?.(nextStrategy)

      if (nextStrategy === 'single') {
        if (committedRange.start) {
          onChange?.(formatDateIso(committedRange.start))
        }

        onRangeChange?.({ start: committedRange.start ? formatDateIso(committedRange.start) : null, end: null })
        setInputValue(
          buildDisplayValue({
            strategy: nextStrategy,
            committedDate: committedRange.start ?? committedDate,
            committedRange: { start: committedRange.start, end: null },
          }),
        )
        return
      }

      const nextRange = {
        start: committedRange.start ?? committedDate,
        end: committedRange.end,
      }
      setInputValue(formatCommittedRangeInput(nextRange))
      onRangeChange?.({
        start: nextRange.start ? formatDateIso(nextRange.start) : null,
        end: nextRange.end ? formatDateIso(nextRange.end) : null,
      })
    },
    [committedDate, committedRange, onChange, onRangeChange, onStrategyChange, selectionMode],
  )

  const handleCalendarSelect = useCallback(
    (selection: CalendarValue) => {
      if (disabled) return

      if (calendarSelectionMode === 'range') {
        const nextRange =
          selection && typeof selection === 'object' && !Array.isArray(selection) && 'start' in selection
            ? {
                start: selection.start ?? null,
                end: selection.end ?? null,
              }
            : EMPTY_RANGE

        const committed = commitRange(nextRange)
        if (!committed) {
          return
        }

        if (nextRange.start && nextRange.end) {
          closePopover()
        }

        return
      }

      if (!(selection instanceof Date)) {
        return
      }

      const committed = commitDate(selection)
      if (!committed) {
        return
      }

      onCalendarSelect?.(selection)
      closePopover()
    },
    [calendarSelectionMode, closePopover, commitDate, commitRange, disabled, onCalendarSelect],
  )

  const handleVisibleMonthChange = useCallback((month: Date) => {
    setVisibleMonth(month)
  }, [])

  return {
    strategy: resolvedStrategy,
    selectionMode,
    inputValue,
    committedDate,
    committedRange,
    isOpen,
    visibleMonth,
    openPopover,
    closePopover,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    handleStrategyChange,
    handleCalendarSelect,
    handleVisibleMonthChange,
  }
}
