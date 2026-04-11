import { useMemo, useState } from 'react'

import { getCalendarDayKey } from '../domain/dayKey.utils'
import { CalendarDayCell } from '../ui/CalendarDayCell'
import { CalendarRoot } from '../ui/CalendarRoot'
import { useCalendarModel } from '../model/useCalendarModel'
import type { CalendarRangeValue } from '../model/calendar.types'

const mockDensityByDay: Record<string, number> = {
  '2026-03-02': 2,
  '2026-03-04': 5,
  '2026-03-10': 3,
}

export const CalendarSandboxExample = () => {
  const [singleValue, setSingleValue] = useState<Date | null>(null)
  const [rangeValue, setRangeValue] = useState<CalendarRangeValue>({ start: null, end: null })
  const [multipleValue, setMultipleValue] = useState<Date[]>([])

  const singleModel = useCalendarModel({
    selectionMode: 'single',
    value: singleValue,
    onChange: (value) => setSingleValue(value instanceof Date ? value : null),
  })

  const rangeModel = useCalendarModel({
    selectionMode: 'range',
    value: rangeValue,
    onChange: (value) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && 'start' in value && 'end' in value) {
        setRangeValue(value)
      }
    },
  })

  const multipleModel = useCalendarModel({
    selectionMode: 'multiple',
    value: multipleValue,
    onChange: (value) => setMultipleValue(Array.isArray(value) ? value : []),
  })

  const selectedSingleLabel = useMemo(() => {
    return singleValue ? singleValue.toISOString().slice(0, 10) : 'none'
  }, [singleValue])

  return (
    <div>
      <h3>Single picker</h3>
      <p>Selected: {selectedSingleLabel}</p>
      <CalendarRoot model={singleModel} />

      <h3>Range picker</h3>
      <CalendarRoot model={rangeModel} />

      <h3>Multiple picker with overlay composition</h3>
      <CalendarRoot
        model={multipleModel}
        renderDay={(params) => {
          const key = getCalendarDayKey(params.date)
          const density = mockDensityByDay[key] ?? 0

          return (
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
            >
              <div>{params.date.getDate()}</div>
              {density > 0 ? <small>Load {density}</small> : null}
            </CalendarDayCell>
          )
        }}
      />
    </div>
  )
}
