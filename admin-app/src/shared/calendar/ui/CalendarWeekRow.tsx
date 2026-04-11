import type { ReactNode } from 'react'

export const CalendarWeekRow = ({ children }: { children: ReactNode }) => {
  return (
    <div role='row' data-calendar-week-row='true' className='grid grid-cols-7'>
      {children}
    </div>
  )
}
