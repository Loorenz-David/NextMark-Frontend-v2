import { createElement } from 'react'
import type { KeyboardEvent } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { buildMonthMatrix } from '../domain/monthMatrix.builder'
import { getCalendarDayKey } from '../domain/dayKey.utils'
import type { CalendarModel } from '../model/calendar.types'
import { resolveFocusDayKey } from '../model/useCalendarModel'
import { CalendarDayCell, buildDayCellKeyDownHandler } from '../ui/CalendarDayCell'
import { CalendarRoot } from '../ui/CalendarRoot'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const countOccurrences = (value: string, pattern: string): number => {
  return value.split(pattern).length - 1
}

export const runCalendarUiAccessibilityTests = () => {
  const day = {
    date: new Date(2026, 2, 2),
    isCurrentMonth: true,
  }

  const dayMarkup = renderToStaticMarkup(
    createElement(
      CalendarDayCell,
      {
        day,
        isSelected: true,
        isInRange: false,
        onSelect: () => undefined,
        tabIndex: 0,
        ariaLabel: 'March 2, 2026',
        isToday: true,
      },
      '2',
    ),
  )

  assert(dayMarkup.includes('role="gridcell"'), 'Day cell should render role="gridcell"')
  assert(dayMarkup.includes('aria-selected="true"'), 'Day cell should expose aria-selected')
  assert(dayMarkup.includes('aria-current="date"'), 'Today cell should expose aria-current="date"')
  assert(dayMarkup.includes('aria-label="March 2, 2026"'), 'Day cell should include aria-label')
  assert(dayMarkup.includes('data-day-key="2026-03-02"'), 'Day cell should include stable data-day-key')

  const outsideDayMarkup = renderToStaticMarkup(
    createElement(CalendarDayCell, {
      day: { date: new Date(2026, 1, 28), isCurrentMonth: false },
      isSelected: false,
      isInRange: false,
      onSelect: () => undefined,
      tabIndex: -1,
      ariaLabel: 'February 28, 2026',
      isToday: false,
    }),
  )
  assert(
    outsideDayMarkup.includes('data-outside-month="true"'),
    'Outside-month day should include data-outside-month="true"',
  )

  let selectCount = 0
  let preventDefaultCount = 0
  let passThroughCount = 0

  const keyHandler = buildDayCellKeyDownHandler({
    onSelect: () => {
      selectCount += 1
    },
    onKeyDown: () => {
      passThroughCount += 1
    },
  })

  keyHandler({
    key: 'Enter',
    preventDefault: () => undefined,
  } as KeyboardEvent<HTMLElement>)

  keyHandler({
    key: ' ',
    preventDefault: () => {
      preventDefaultCount += 1
    },
  } as KeyboardEvent<HTMLElement>)

  assert(selectCount === 2, 'Enter and Space should trigger onSelect')
  assert(preventDefaultCount === 1, 'Space should prevent default scroll')
  assert(passThroughCount === 2, 'Custom onKeyDown should still be invoked')

  const daysMatrix = buildMonthMatrix({ year: 2026, month: 2, weekStartsOn: 1 })
  const flatDays = daysMatrix.flat()
  const focusDayKey = resolveFocusDayKey({
    selectionMode: 'single',
    value: null,
    visibleMonth: new Date(2026, 2, 1),
    today: new Date(2026, 10, 4),
    flatDays,
  })

  const model: CalendarModel = {
    visibleMonth: new Date(2026, 2, 1),
    daysMatrix,
    selectionMode: 'single',
    focusDayKey,
    isRangeSelectionInProgress: false,
    selectDate: () => undefined,
    nextMonth: () => undefined,
    prevMonth: () => undefined,
    goToToday: () => undefined,
    setHoveredDate: () => undefined,
    isSelected: () => false,
    isInRange: () => false,
  }

  const rootMarkup = renderToStaticMarkup(createElement(CalendarRoot, { model }))

  assert(rootMarkup.includes('role="grid"'), 'Calendar grid should render role="grid"')
  assert(rootMarkup.includes('role="row"'), 'Calendar row should render role="row"')
  assert(countOccurrences(rootMarkup, 'tabindex="0"') === 1, 'Exactly one day cell must be tabbable')
  assert(countOccurrences(rootMarkup, 'tabindex="-1"') === 41, 'All other day cells must be untabbable')

  const firstCurrentMonthDay = flatDays.find((entry) => entry.isCurrentMonth)
  assert(Boolean(firstCurrentMonthDay), 'Matrix should include current-month days')

  if (firstCurrentMonthDay) {
    assert(
      focusDayKey === getCalendarDayKey(firstCurrentMonthDay.date),
      'When today is outside visible month and no value, focus should target first day of visible month',
    )
  }
}
