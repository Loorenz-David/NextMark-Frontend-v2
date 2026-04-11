import { useEffect, useMemo, useRef } from 'react'

import {
  useRoutePlanDateFilterUIActions,
  useRoutePlanDateFilterUIState,
} from '@/features/plan/store/routePlanDateFilterUI.store'

import { PLAN_DATE_FILTER_DEFAULT_MODE } from './domain/planDateFilter.constants'
import type { PlanDateFilterControllerParams, PlanDateFilterMode } from './domain/planDateFilter.types'
import {
  buildPlanFiltersFromSelection,
  formatDayLabel,
  formatMonthLabel,
  normalizeRange,
  shiftSingleValueByMode,
} from './domain/planDateFilter.utils'

export const usePlanDateFilterController = ({
  onFiltersChange,
  onSelectionChange,
  initialMode = PLAN_DATE_FILTER_DEFAULT_MODE,
}: PlanDateFilterControllerParams = {}) => {
  void initialMode
  const persistedState = useRoutePlanDateFilterUIState()
  const persistedActions = useRoutePlanDateFilterUIActions()
  const lastEmissionKeyRef = useRef<string | null>(null)

  const mode = persistedState.mode
  const singleDate = persistedState.singleDate
  const rangeStart = persistedState.rangeStart
  const rangeEnd = persistedState.rangeEnd

  const setMode = (nextMode: PlanDateFilterMode) => {
    persistedActions.setMode(nextMode)
  }

  const setSingleDate = (date: Date) => {
    persistedActions.setSingleDate(date)
  }

  const setRangeStart = (date: Date) => {
    persistedActions.setRangeStart(date)
  }

  const setRangeEnd = (date: Date) => {
    persistedActions.setRangeEnd(date)
  }

  const normalizedRange = useMemo(() => normalizeRange(rangeStart, rangeEnd), [rangeEnd, rangeStart])

  const filters = useMemo(
    () =>
      buildPlanFiltersFromSelection({
        mode,
        singleDate,
        rangeStart: normalizedRange.start,
        rangeEnd: normalizedRange.end,
      }),
    [mode, normalizedRange.end, normalizedRange.start, singleDate],
  )

  useEffect(() => {
    const emissionKey = JSON.stringify({ mode, ...filters })
    if (lastEmissionKeyRef.current === emissionKey) {
      return
    }

    lastEmissionKeyRef.current = emissionKey
    onFiltersChange?.(filters)
    onSelectionChange?.({
      filters,
      selection: {
        mode,
        singleDate,
        rangeStart: normalizedRange.start,
        rangeEnd: normalizedRange.end,
      },
    })
  }, [filters, mode, normalizedRange.end, normalizedRange.start, onFiltersChange, onSelectionChange, singleDate])

  const goToPrevious = () => {
    if (mode === 'range') return
    setSingleDate(shiftSingleValueByMode(mode, singleDate, 'prev'))
  }

  const goToNext = () => {
    if (mode === 'range') return
    setSingleDate(shiftSingleValueByMode(mode, singleDate, 'next'))
  }

  const displayLabel =
    mode === 'month' ? formatMonthLabel(singleDate) : formatDayLabel(singleDate)

  return {
    mode,
    setMode,
    singleDate,
    setSingleDate,
    rangeStart: normalizedRange.start,
    rangeEnd: normalizedRange.end,
    setRangeStart,
    setRangeEnd,
    displayLabel,
    displayRangeLabel: {
      start: formatDayLabel(normalizedRange.start),
      end: formatDayLabel(normalizedRange.end),
    },
    goToPrevious,
    goToNext,
    filters,
  }
}
