import { useEffect, useMemo, useRef } from 'react'

import { useCustomDatePickerController } from './model/useCustomDatePickerController'
import {
  formatDateIso,
  isToday,
  resolveEffectiveMinDate,
} from './model/customDatePicker.utils'
import type { CustomDatePickerProps } from './model/customDatePicker.types'
import { CustomDatePickerDesktopView } from './views/CustomDatePickerDesktopView'

export const CustomDatePicker = ({
  selectionMode = 'single',
  strategy,
  date,
  rangeValue,
  onChange,
  onRangeChange,
  onStrategyChange,
  disabled,
  disablePast,
  minDate,
  maxDate,
  className,
  renderPopoverInPortal,
  open,
  onOpenChange,
  onCalendarSelect,
}: CustomDatePickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const effectiveMinDate = useMemo(
    () => resolveEffectiveMinDate({ minDate, disablePast }),
    [disablePast, minDate],
  )

  const controller = useCustomDatePickerController({
    selectionMode,
    strategy,
    date,
    rangeValue,
    onChange,
    onRangeChange,
    onStrategyChange,
    disabled,
    minDate: effectiveMinDate,
    maxDate,
    open,
    onOpenChange,
    onCalendarSelect,
  })

  const showTodayLabel = useMemo(() => {
    if (controller.strategy === 'range') return false
    if (!controller.committedDate) return false
    if (!isToday(controller.committedDate)) return false

    return controller.inputValue === formatDateIso(controller.committedDate)
  }, [controller.committedDate, controller.inputValue, controller.strategy])

  useEffect(() => {
    if (!controller.isOpen) return

    inputRef.current?.blur()
  }, [controller.isOpen])

  return (
    <CustomDatePickerDesktopView
      pickerMode={selectionMode}
      strategy={controller.strategy}
      inputValue={controller.inputValue}
      showTodayLabel={showTodayLabel}
      committedDate={controller.committedDate}
      committedRange={controller.committedRange}
      isOpen={controller.isOpen}
      visibleMonth={controller.visibleMonth}
      disabled={disabled}
      readOnly={selectionMode !== 'single'}
      className={className}
      renderPopoverInPortal={renderPopoverInPortal}
      minDate={effectiveMinDate}
      maxDate={maxDate}
      inputRef={inputRef}
      onOpen={controller.openPopover}
      onClose={controller.closePopover}
      onInputBlur={controller.handleInputBlur}
      onInputChange={controller.handleInputChange}
      onInputKeyDown={controller.handleInputKeyDown}
      onCalendarSelect={(selectedValue) => {
        controller.handleCalendarSelect(selectedValue)

        if (!disabled && controller.strategy === 'single') {
          requestAnimationFrame(() => {
            inputRef.current?.focus()
          })
        }
      }}
      onStrategyChange={controller.handleStrategyChange}
      onVisibleMonthChange={controller.handleVisibleMonthChange}
    />
  )
}
