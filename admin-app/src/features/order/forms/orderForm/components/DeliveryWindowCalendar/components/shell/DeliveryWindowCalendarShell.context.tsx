import { createContext, useContext } from 'react'

import {
  DEFAULT_DELIVERY_WINDOW_CALENDAR_SHELL_PRESET,
  resolveDeliveryWindowCalendarShellScale,
  type DeliveryWindowCalendarShellScale,
} from '../../DeliveryWindowCalendarShell.flow'

export const DeliveryWindowCalendarShellContext =
  createContext<DeliveryWindowCalendarShellScale>(
    resolveDeliveryWindowCalendarShellScale({
      preset: DEFAULT_DELIVERY_WINDOW_CALENDAR_SHELL_PRESET,
    }),
  )


export const useDeliveryWindowCalendarShellScale = () =>
  useContext(DeliveryWindowCalendarShellContext)
