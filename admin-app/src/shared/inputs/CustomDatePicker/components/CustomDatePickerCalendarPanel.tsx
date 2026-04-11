import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'

import { BackArrowIcon2 } from '@/assets/icons'
import {
  CalendarDayCell,
  CalendarRoot,
  addDays,
  getCalendarDayKey,
  useCalendarModel,
  type CalendarRangeValue,
  type CalendarSelectionMode,
  type CalendarValue,
} from '@/shared/calendar'

import { isDateWithinRange, normalizeToDay } from '../model/customDatePicker.utils'
import type { CustomDatePickerMode, CustomDatePickerStrategy } from '../model/customDatePicker.types'

type CustomDatePickerCalendarPanelProps = {
  isOpen: boolean
  pickerMode?: CustomDatePickerMode
  strategy?: CustomDatePickerStrategy
  value: CalendarValue
  visibleMonth: Date
  minDate?: Date
  maxDate?: Date
  onVisibleMonthChange: (month: Date) => void
  onSelect: (value: CalendarValue) => void
  onStrategyChange?: (strategy: CustomDatePickerStrategy) => void
  onRequestClose: () => void
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const isRangeValue = (value: CalendarValue): value is CalendarRangeValue =>
  value != null && typeof value === 'object' && !Array.isArray(value) && 'start' in value

export const CustomDatePickerCalendarPanel = ({
  isOpen,
  pickerMode = 'single',
  strategy = 'single',
  value,
  visibleMonth,
  minDate,
  maxDate,
  onVisibleMonthChange,
  onSelect,
  onStrategyChange,
  onRequestClose,
}: CustomDatePickerCalendarPanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const today = useMemo(() => normalizeToDay(new Date()), [])
  const calendarSelectionMode: CalendarSelectionMode =
    pickerMode === 'range' || strategy === 'range' ? 'range' : 'single'

  const normalizedValue = useMemo<CalendarValue>(() => {
    if (calendarSelectionMode === 'range') {
      return isRangeValue(value)
        ? {
            start: value.start ? normalizeToDay(value.start) : null,
            end: value.end ? normalizeToDay(value.end) : null,
          }
        : { start: null, end: null }
    }

    return value instanceof Date ? normalizeToDay(value) : null
  }, [calendarSelectionMode, value])

  const model = useCalendarModel({
    selectionMode: calendarSelectionMode,
    value: normalizedValue,
    visibleMonth,
    onVisibleMonthChange,
    onChange: onSelect,
  })

  const selectedSingleDate =
    normalizedValue instanceof Date ? normalizedValue : null
  const selectedRange = isRangeValue(normalizedValue)
    ? normalizedValue
    : { start: null, end: null }

  const isTodaySelected = useMemo(() => {
    if (calendarSelectionMode === 'range') {
      return Boolean(
        selectedRange.start &&
          selectedRange.end &&
          selectedRange.start.getTime() === today.getTime() &&
          selectedRange.end.getTime() === today.getTime(),
      )
    }

    return Boolean(selectedSingleDate && selectedSingleDate.getTime() === today.getTime())
  }, [calendarSelectionMode, selectedRange.end, selectedRange.start, selectedSingleDate, today])

  const isTodayDisabled = useMemo(
    () =>
      !isDateWithinRange({
        date: today,
        minDate,
        maxDate,
      }),
    [maxDate, minDate, today],
  )

  useEffect(() => {
    if (!isOpen || !panelRef.current) return

    const focusTarget =
      panelRef.current.querySelector<HTMLElement>("[data-selected='true']") ||
      panelRef.current.querySelector<HTMLElement>("[aria-current='date']") ||
      panelRef.current.querySelector<HTMLElement>('[data-day-key]')

    focusTarget?.focus()
  }, [isOpen, visibleMonth, model.daysMatrix])

  return (
    <motion.div
      ref={panelRef}
      className='admin-glass-popover w-[310px] overflow-hidden rounded-lg border border-[var(--color-border-accent)] p-3 text-sm shadow-md'
      initial={{ height: 0, opacity: 0, y: -4 }}
      animate={{ height: 'auto', opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onRequestClose()
        }
      }}
    >
      {pickerMode === 'single_or_range' ? (
        <div className='mb-3 flex items-center gap-2 rounded-lg border border-[var(--color-border-accent)] bg-[var(--color-page)]/60 p-1'>
          <button
            type='button'
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
              strategy === 'single'
                ? 'bg-[var(--color-primary)] text-[var(--color-secondary)]'
                : 'text-[var(--color-muted)] hover:bg-white/[0.06]'
            }`}
            onClick={() => onStrategyChange?.('single')}
          >
            Single
          </button>
          <button
            type='button'
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
              strategy === 'range'
                ? 'bg-[var(--color-primary)] text-[var(--color-secondary)]'
                : 'text-[var(--color-muted)] hover:bg-white/[0.06]'
            }`}
            onClick={() => onStrategyChange?.('range')}
          >
            Range
          </button>
        </div>
      ) : null}

      <CalendarRoot
        model={model}
        renderHeader={(calendarModel) => {
          const monthLabel = calendarModel.visibleMonth.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })

          return (
            <div className='mb-2'>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <button
                  type='button'
                  className='rounded-md p-1 hover:bg-white/[0.08]'
                  onClick={calendarModel.prevMonth}
                  aria-label='Previous month'
                >
                  <BackArrowIcon2 className='h-4 w-4 text-[var(--color-text)]' />
                </button>

                <div className='text-sm font-semibold text-[var(--color-text)]'>{monthLabel}</div>

                <button
                  type='button'
                  className='rounded-md p-1 hover:bg-white/[0.08]'
                  onClick={calendarModel.nextMonth}
                  aria-label='Next month'
                >
                  <BackArrowIcon2 className='h-4 w-4 rotate-180 text-[var(--color-text)]' />
                </button>
              </div>
              <div className='grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wide text-[var(--color-muted)]/80'>
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          )
        }}
        renderDay={({ day, date, isSelected, isInRange, tabIndex, ariaLabel, isToday, onMouseEnter, onMouseLeave }) => {
          const normalizedDate = normalizeToDay(date)
          const isDisabled = !isDateWithinRange({
            date: normalizedDate,
            minDate,
            maxDate,
          })

          return (
            <CalendarDayCell
              day={day}
              isSelected={isSelected}
              isInRange={isInRange}
              onSelect={() => {
                if (isDisabled) return
                model.selectDate(normalizedDate)
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={tabIndex}
              ariaLabel={ariaLabel}
              isToday={isToday}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onRequestClose()
                  return
                }

                const stepByKey: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowRight: 1,
                  ArrowUp: -7,
                  ArrowDown: 7,
                }

                const step = stepByKey[event.key]
                if (!step) return

                event.preventDefault()

                const nextDay = addDays(normalizedDate, step)
                const nextKey = getCalendarDayKey(nextDay)
                const nextNode = panelRef.current?.querySelector<HTMLElement>(
                  `[data-day-key='${nextKey}']`,
                )

                nextNode?.focus()
              }}
              className={[
                'h-9 w-9 rounded-md text-xs font-medium transition-colors',
                day.isCurrentMonth ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]/50',
                isToday && !isSelected
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[var(--color-primary)]'
                  : '',
                isSelected
                  ? 'bg-[var(--color-primary)] !text-[var(--color-secondary)]'
                  : '',
                isInRange && !isSelected
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-[var(--color-text)]'
                  : '',
                !isSelected && !isDisabled ? 'hover:bg-white/[0.08]' : '',
                isDisabled ? 'cursor-not-allowed opacity-35' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </CalendarDayCell>
          )
        }}
      />

      {calendarSelectionMode === 'single' && !isTodaySelected ? (
        <div className='mt-2 border-t border-white/[0.08] pt-2'>
          <button
            type='button'
            className='w-full rounded-md py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] disabled:cursor-not-allowed disabled:text-[var(--color-muted)]/70 disabled:hover:bg-transparent'
            onClick={() => {
              if (isTodayDisabled) return
              onSelect(today)
            }}
            disabled={isTodayDisabled}
          >
            Today
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}
