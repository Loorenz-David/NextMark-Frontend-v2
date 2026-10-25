import type { ReactNode } from 'react'
import type { CalendarModel } from './calendar.types'
import { CalendarContext } from './CalendarContext'

export const CalendarProvider = ({
  model,
  children,
}: {
  model: CalendarModel
  children: ReactNode
}) => {
  return <CalendarContext.Provider value={model}>{children}</CalendarContext.Provider>
}
