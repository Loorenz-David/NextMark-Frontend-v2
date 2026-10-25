import { createContext, useContext } from 'react'

import type { CalendarModel } from './calendar.types'

export const CalendarContext = createContext<CalendarModel | null>(null)


export const useCalendarContext = (): CalendarModel => {
  const context = useContext(CalendarContext)

  if (!context) {
    throw new Error('CalendarContext is not available. Wrap your subtree with CalendarProvider.')
  }

  return context
}
