import type { KeyboardEvent, RefObject } from 'react'

import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import type { CalendarRangeValue, CalendarValue } from '@/shared/calendar'

import { CustomDatePickerCalendarPanel } from '../components/CustomDatePickerCalendarPanel'
import { CustomDatePickerInput } from '../components/CustomDatePickerInput'
import type {
  CustomDatePickerMode,
  CustomDatePickerStrategy,
} from '../model/customDatePicker.types'

type CustomDatePickerDesktopViewProps = {
  pickerMode: CustomDatePickerMode
  strategy: CustomDatePickerStrategy
  inputValue: string
  showTodayLabel: boolean
  committedDate: Date | null
  committedRange: CalendarRangeValue
  isOpen: boolean
  visibleMonth: Date
  disabled?: boolean
  readOnly?: boolean
  className?: string
  renderPopoverInPortal?: boolean
  minDate?: Date
  maxDate?: Date
  inputRef: RefObject<HTMLInputElement | null>
  onOpen: () => void
  onClose: () => void
  onInputBlur: () => void
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCalendarSelect: (value: CalendarValue) => void
  onStrategyChange: (strategy: CustomDatePickerStrategy) => void
  onVisibleMonthChange: (month: Date) => void
}

export const CustomDatePickerDesktopView = ({
  pickerMode,
  strategy,
  inputValue,
  showTodayLabel,
  committedDate,
  committedRange,
  isOpen,
  visibleMonth,
  disabled,
  readOnly,
  className,
  renderPopoverInPortal,
  minDate,
  maxDate,
  inputRef,
  onOpen,
  onClose,
  onInputBlur,
  onInputChange,
  onInputKeyDown,
  onCalendarSelect,
  onStrategyChange,
  onVisibleMonthChange,
}: CustomDatePickerDesktopViewProps) => {
  const pickerValue =
    pickerMode === 'range' || strategy === 'range'
      ? committedRange
      : committedDate

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpen()
          return
        }

        onClose()
      }}
      classes='relative'
      renderInPortal={renderPopoverInPortal ?? true}
      floatingClassName='z-[220]'
      reference={
        <CustomDatePickerInput
          value={inputValue}
          showTodayLabel={showTodayLabel}
          readOnly={readOnly}
          disabled={disabled}
          className={className}
          onOpen={onOpen}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          onChange={onInputChange}
          inputRef={inputRef}
        />
      }
    >
      <CustomDatePickerCalendarPanel
        isOpen={isOpen}
        pickerMode={pickerMode}
        strategy={strategy}
        value={pickerValue}
        visibleMonth={visibleMonth}
        minDate={minDate}
        maxDate={maxDate}
        onVisibleMonthChange={onVisibleMonthChange}
        onSelect={onCalendarSelect}
        onStrategyChange={onStrategyChange}
        onRequestClose={onClose}
      />
    </FloatingPopover>
  )
}
