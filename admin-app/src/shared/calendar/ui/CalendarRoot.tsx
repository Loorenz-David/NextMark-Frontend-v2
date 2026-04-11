import { useEffect, useMemo, useRef } from 'react'
import type { FocusEvent } from 'react'

import { CalendarProvider } from '../model/CalendarContext'
import type { CalendarRootProps, DayRenderParams } from '../model/calendar.types'
import { getCalendarDayKey } from '../domain/dayKey.utils'
import { isSameDay } from '../domain/comparison.utils'
import { normalizeToCalendarDay } from '../domain/normalize.utils'

import { CalendarDayCell } from './CalendarDayCell'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'

const formatAriaDayLabel = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const CalendarRoot = ({ model, renderHeader, renderDay }: CalendarRootProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const hadFocusWithinRef = useRef(false)

  const today = useMemo(() => normalizeToCalendarDay(new Date()), [])

  const fallbackFocusKey = useMemo(() => {
    const firstDay = model.daysMatrix[0]?.[0]
    return firstDay ? getCalendarDayKey(firstDay.date) : ''
  }, [model.daysMatrix])

  const focusDayKey = model.focusDayKey || fallbackFocusKey

  const onFocusCapture = () => {
    hadFocusWithinRef.current = true
  }

  const onBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!rootRef.current) {
      hadFocusWithinRef.current = false
      return
    }

    const nextFocused = event.relatedTarget
    if (!nextFocused || !rootRef.current.contains(nextFocused)) {
      hadFocusWithinRef.current = false
    }
  }

  useEffect(() => {
    if (!hadFocusWithinRef.current || !rootRef.current || !focusDayKey) {
      return
    }

    const target = rootRef.current.querySelector<HTMLElement>(`[data-day-key='${focusDayKey}']`)
    target?.focus()
  }, [focusDayKey, model.visibleMonth, model.daysMatrix])

  const defaultHeader = (
    <CalendarHeader
      visibleMonth={model.visibleMonth}
      nextMonth={model.nextMonth}
      prevMonth={model.prevMonth}
      goToToday={model.goToToday}
    />
  )

  return (
    <CalendarProvider model={model}>
      <div ref={rootRef} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
        {renderHeader ? renderHeader(model) : defaultHeader}
        <CalendarGrid
          daysMatrix={model.daysMatrix}
          renderDay={(day) => {
            const onSelect = () => model.selectDate(day.date)
            const dayKey = getCalendarDayKey(day.date)
            const tabIndex = dayKey === focusDayKey ? 0 : -1
            const dayRenderParams: DayRenderParams = {
              day,
              date: day.date,
              isCurrentMonth: day.isCurrentMonth,
              isSelected: model.isSelected(day.date),
              isInRange: model.isInRange(day.date),
              onSelect,
              tabIndex,
              onMouseEnter:
                model.selectionMode === 'range' && model.isRangeSelectionInProgress
                  ? () => model.setHoveredDate(day.date)
                  : undefined,
              onMouseLeave:
                model.selectionMode === 'range' && model.isRangeSelectionInProgress
                  ? () => model.setHoveredDate(null)
                  : undefined,
              ariaLabel: formatAriaDayLabel(day.date),
              isToday: isSameDay(normalizeToCalendarDay(day.date), today),
            }

            if (renderDay) {
              return renderDay(dayRenderParams)
            }

            return (
              <CalendarDayCell
                day={day}
                isSelected={dayRenderParams.isSelected}
                isInRange={dayRenderParams.isInRange}
                onSelect={dayRenderParams.onSelect}
                tabIndex={dayRenderParams.tabIndex}
                onMouseEnter={dayRenderParams.onMouseEnter}
                onMouseLeave={dayRenderParams.onMouseLeave}
                ariaLabel={dayRenderParams.ariaLabel}
                isToday={dayRenderParams.isToday}
              >
                {day.date.getDate()}
              </CalendarDayCell>
            )
          }}
        />
      </div>
    </CalendarProvider>
  )
}

/*
DnD composition pattern (feature-layer only):

<DndContext>
  <CalendarRoot
    model={calendarModel}
    renderDay={({ date, ...params }) => (
      <DroppableDayWrapper id={getCalendarDayKey(date)}>
        <CalendarDayCell
          day={params.day}
          isSelected={params.isSelected}
          isInRange={params.isInRange}
          onSelect={params.onSelect}
          tabIndex={params.tabIndex}
          onKeyDown={params.onKeyDown}
          onMouseEnter={params.onMouseEnter}
          onMouseLeave={params.onMouseLeave}
          ariaLabel={params.ariaLabel}
          isToday={params.isToday}
        />
        <FeatureDayContent date={date} />
      </DroppableDayWrapper>
    )}
  />
</DndContext>
*/
