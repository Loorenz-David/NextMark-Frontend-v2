import { create } from 'zustand'

import { PLAN_DATE_FILTER_DEFAULT_MODE } from '@/features/plan/components/planDateFilter/domain/planDateFilter.constants'
import type { PlanDateFilterMode } from '@/features/plan/components/planDateFilter/domain/planDateFilter.types'
import {
  formatDateIso,
  normalizeToDay,
  parseIsoDate,
} from '@/shared/inputs/CustomDatePicker/model/customDatePicker.utils'

type RoutePlanDateFilterUIState = {
  mode: PlanDateFilterMode
  singleDateIso: string
  rangeStartIso: string
  rangeEndIso: string
  setMode: (mode: PlanDateFilterMode) => void
  setSingleDate: (date: Date) => void
  setRangeStart: (date: Date) => void
  setRangeEnd: (date: Date) => void
}

const today = normalizeToDay(new Date())
const todayIso = formatDateIso(today)
const nextWeek = normalizeToDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6))
const nextWeekIso = formatDateIso(nextWeek)

export const useRoutePlanDateFilterUIStore = create<RoutePlanDateFilterUIState>((set) => ({
  mode: PLAN_DATE_FILTER_DEFAULT_MODE,
  singleDateIso: todayIso,
  rangeStartIso: todayIso,
  rangeEndIso: nextWeekIso,
  setMode: (mode) => set(() => ({ mode })),
  setSingleDate: (date) => set(() => ({ singleDateIso: formatDateIso(normalizeToDay(date)) })),
  setRangeStart: (date) => set(() => ({ rangeStartIso: formatDateIso(normalizeToDay(date)) })),
  setRangeEnd: (date) => set(() => ({ rangeEndIso: formatDateIso(normalizeToDay(date)) })),
}))

const resolveDateFromIso = (iso: string, fallback: Date) => {
  return parseIsoDate(iso) ?? fallback
}

export const useRoutePlanDateFilterUIState = () => {
  const mode = useRoutePlanDateFilterUIStore((state) => state.mode)
  const singleDateIso = useRoutePlanDateFilterUIStore((state) => state.singleDateIso)
  const rangeStartIso = useRoutePlanDateFilterUIStore((state) => state.rangeStartIso)
  const rangeEndIso = useRoutePlanDateFilterUIStore((state) => state.rangeEndIso)

  return {
    mode,
    singleDate: resolveDateFromIso(singleDateIso, today),
    rangeStart: resolveDateFromIso(rangeStartIso, today),
    rangeEnd: resolveDateFromIso(rangeEndIso, nextWeek),
  }
}

export const useRoutePlanDateFilterUIActions = () => {
  const setMode = useRoutePlanDateFilterUIStore((state) => state.setMode)
  const setSingleDate = useRoutePlanDateFilterUIStore((state) => state.setSingleDate)
  const setRangeStart = useRoutePlanDateFilterUIStore((state) => state.setRangeStart)
  const setRangeEnd = useRoutePlanDateFilterUIStore((state) => state.setRangeEnd)

  return {
    setMode,
    setSingleDate,
    setRangeStart,
    setRangeEnd,
  }
}
