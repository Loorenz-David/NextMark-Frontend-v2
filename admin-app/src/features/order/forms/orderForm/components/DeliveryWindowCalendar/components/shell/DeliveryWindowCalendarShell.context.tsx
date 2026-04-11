import { createContext, useContext } from 'react'

import {
  DEFAULT_DELIVERY_WINDOW_CALENDAR_SHELL_PRESET,
  resolveDeliveryWindowCalendarShellScale,
  type DeliveryWindowCalendarShellScale,
} from '../../DeliveryWindowCalendarShell.flow'

const DeliveryWindowCalendarShellContext =
  createContext<DeliveryWindowCalendarShellScale>(
    resolveDeliveryWindowCalendarShellScale({
      preset: DEFAULT_DELIVERY_WINDOW_CALENDAR_SHELL_PRESET,
    }),
  )

export const DeliveryWindowCalendarShellScaleProvider = DeliveryWindowCalendarShellContext.Provider

export const useDeliveryWindowCalendarShellScale = () =>
  useContext(DeliveryWindowCalendarShellContext)
