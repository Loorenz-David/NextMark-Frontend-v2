import type { KeyboardEvent, ReactNode } from 'react'

import type { CalendarDay } from '../domain/monthMatrix.builder'

export type CalendarSelectionMode = 'single' | 'range' | 'multiple' | 'readonly'

export type CalendarRangeValue = {
  start: Date | null
  end: Date | null
}

export type CalendarValue = Date | Date[] | CalendarRangeValue | null

export type UseCalendarModelProps = {
  value?: CalendarValue
  defaultValue?: CalendarValue
  onChange?: (value: CalendarValue) => void
  selectionMode?: CalendarSelectionMode
  weekStartsOn?: number
  visibleMonth?: Date
  onVisibleMonthChange?: (month: Date) => void
}

export type CalendarValidationResult = {
  isValid: boolean
  expected: string
  actual: string
}

export type CalendarModel = {
  visibleMonth: Date
  daysMatrix: CalendarDay[][]
  selectionMode: CalendarSelectionMode
  focusDayKey: string
  isRangeSelectionInProgress: boolean
  selectDate: (date: Date) => void
  nextMonth: () => void
  prevMonth: () => void
  goToToday: () => void
  setHoveredDate: (date: Date | null) => void
  isSelected: (date: Date) => boolean
  isInRange: (date: Date) => boolean
}

export type DayRenderParams = {
  day: CalendarDay
  date: Date
  isCurrentMonth: boolean
  isSelected: boolean
  isInRange: boolean
  onSelect: () => void
  tabIndex: number
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  ariaLabel: string
  isToday: boolean
}

export type CalendarRootProps = {
  model: CalendarModel
  renderHeader?: (model: CalendarModel) => ReactNode
  renderDay?: (params: DayRenderParams) => ReactNode
}
