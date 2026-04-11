import { useCallback } from 'react'

import type { CostumerOperatingHours } from '@/features/costumer'
import type { OrderDeliveryWindow } from '@/features/order/types/order'

import { buildWindowsFromLocalDates } from '../../flows/orderFormDeliveryWindows.flow'
import type { DeliveryWindowDisplayRow } from '../../flows/orderFormDeliveryWindows.flow'

type UseDeliveryWindowCalendarActionsArgs = {
  localDates: string[]
  startTime: string | null
  endTime: string | null
  existingWindows: OrderDeliveryWindow[]
  existingWindowsForApply?: OrderDeliveryWindow[]
  operatingHours: CostumerOperatingHours[]
  timeZone: string
  onApply: (nextWindows: OrderDeliveryWindow[]) => void
  onCloseEditor: () => void
  onResetSelection: () => void
  onMessage: (message: string | null) => void
}

export const doesDeliveryWindowMatchRow = (
  window: OrderDeliveryWindow,
  row: Pick<DeliveryWindowDisplayRow, 'startAtUtc' | 'endAtUtc' | 'windowType'> & {
    clientId?: string | null
  },
) => {
  if (row.clientId && window.client_id && row.clientId !== window.client_id) {
    return false
  }

  return (
    window.start_at === row.startAtUtc &&
    window.end_at === row.endAtUtc &&
    window.window_type === row.windowType
  )
}

export const useDeliveryWindowCalendarActions = ({
  localDates,
  startTime,
  endTime,
  existingWindows,
  existingWindowsForApply,
  operatingHours,
  timeZone,
  onApply,
  onCloseEditor,
  onResetSelection,
  onMessage,
}: UseDeliveryWindowCalendarActionsArgs) => {
  const applySelection = useCallback(() => {
    const baseWindows = existingWindowsForApply ?? existingWindows
    const result = buildWindowsFromLocalDates({
      localDates,
      startTime,
      endTime,
      existingWindows: baseWindows,
      operatingHours,
      timeZone,
    })

    if (result.error) {
      onMessage(result.error)
      return
    }

    onApply(result.nextWindows)
    onCloseEditor()
    onResetSelection()

    if (result.skippedClosedDates.length) {
      onMessage(`Skipped closed days: ${result.skippedClosedDates.join(', ')}`)
      return
    }

    onMessage(null)
  }, [
    localDates,
    startTime,
    endTime,
    existingWindows,
    existingWindowsForApply,
    operatingHours,
    timeZone,
    onApply,
    onCloseEditor,
    onResetSelection,
    onMessage,
  ])

  const clearAllWindows = useCallback(() => {
    onApply([])
  }, [onApply])

  const removeWindow = useCallback(
    (target: {
      clientId?: string | null
      startAtUtc: string
      endAtUtc: string
      windowType: OrderDeliveryWindow['window_type']
    }) => {
      const nextWindows = existingWindows.filter((window) => !doesDeliveryWindowMatchRow(window, target))

      onApply(nextWindows)
    },
    [existingWindows, onApply],
  )

  return {
    applySelection,
    clearAllWindows,
    removeWindow,
  }
}
