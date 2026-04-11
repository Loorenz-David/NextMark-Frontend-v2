import type { KeyboardEvent } from 'react'
import type { CalendarRangeValue, CalendarValue } from '@/shared/calendar'

export type CustomDatePickerStrategy = 'single' | 'range'
export type CustomDatePickerMode = 'single' | 'range' | 'single_or_range'
export type CustomDatePickerIsoRange = {
  start: string | null
  end: string | null
}

export type CustomDatePickerProps = {
  selectionMode?: CustomDatePickerMode
  strategy?: CustomDatePickerStrategy
  date?: Date | null
  rangeValue?: CalendarRangeValue
  onChange?: (value: string | null) => void
  onRangeChange?: (value: CustomDatePickerIsoRange) => void
  onStrategyChange?: (value: CustomDatePickerStrategy) => void
  disabled?: boolean
  disablePast?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  renderPopoverInPortal?: boolean
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  onCalendarSelect?: (date: Date) => void
}

export type UseCustomDatePickerControllerInput = CustomDatePickerProps

export type CustomDatePickerController = {
  strategy: CustomDatePickerStrategy
  selectionMode: CustomDatePickerMode
  inputValue: string
  committedDate: Date | null
  committedRange: CalendarRangeValue
  isOpen: boolean
  visibleMonth: Date

  openPopover: () => void
  closePopover: () => void

  handleInputChange: (value: string) => void
  handleInputBlur: () => void
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  handleStrategyChange: (strategy: CustomDatePickerStrategy) => void

  handleCalendarSelect: (value: CalendarValue) => void
  handleVisibleMonthChange: (month: Date) => void
}
