import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { CalendarModel } from './calendar.types'

const CalendarContext = createContext<CalendarModel | null>(null)

export const CalendarProvider = ({
  model,
  children,
}: {
  model: CalendarModel
  children: ReactNode
}) => {
  return <CalendarContext.Provider value={model}>{children}</CalendarContext.Provider>
}

export const useCalendarContext = (): CalendarModel => {
  const context = useContext(CalendarContext)

  if (!context) {
    throw new Error('CalendarContext is not available. Wrap your subtree with CalendarProvider.')
  }

  return context
}
