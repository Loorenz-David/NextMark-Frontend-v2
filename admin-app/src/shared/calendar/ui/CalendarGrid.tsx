import { Fragment } from 'react'
import type { ReactNode } from 'react'

import { getCalendarDayKey } from '../domain/dayKey.utils'
import type { CalendarDay } from '../domain/monthMatrix.builder'

import { CalendarWeekRow } from './CalendarWeekRow'

export type CalendarGridProps = {
  daysMatrix: CalendarDay[][]
  renderDay: (day: CalendarDay) => ReactNode
}

export const CalendarGrid = ({ daysMatrix, renderDay }: CalendarGridProps) => {
  return (
    <div role='grid' data-calendar-grid='true'>
      {daysMatrix.map((week, weekIndex) => (
        <CalendarWeekRow key={`week-${weekIndex}`}>
          {week.map((day) => (
            <Fragment key={getCalendarDayKey(day.date)}>{renderDay(day)}</Fragment>
          ))}
        </CalendarWeekRow>
      ))}
    </div>
  )
}
