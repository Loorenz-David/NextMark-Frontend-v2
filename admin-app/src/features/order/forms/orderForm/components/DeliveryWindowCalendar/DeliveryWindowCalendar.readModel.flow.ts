import type { DeliveryWindowDisplayRow } from '../../flows/orderFormDeliveryWindows.flow'
import {
  formatNoSelectedWindowsHelper,
} from './DeliveryWindowCalendarLayout.flow'

export type SelectedDateSummary = {
  localDate: string
  windowCount: number
}

export type SelectedDateWindowGroup = {
  localDate: string
  windows: DeliveryWindowDisplayRow[]
}

const sortLocalDates = (dates: string[]) => [...new Set(dates)].sort((a, b) => a.localeCompare(b))

export const buildSelectedDateSummaries = ({
  selectedDates,
  windowsByDate,
}: {
  selectedDates: string[]
  windowsByDate: Record<string, DeliveryWindowDisplayRow[]>
}): SelectedDateSummary[] =>
  sortLocalDates(selectedDates).map((localDate) => ({
    localDate,
    windowCount: windowsByDate[localDate]?.length ?? 0,
  }))

export const buildSelectedDateWindowGroups = ({
  selectedDates,
  windowsByDate,
}: {
  selectedDates: string[]
  windowsByDate: Record<string, DeliveryWindowDisplayRow[]>
}): SelectedDateWindowGroup[] =>
  sortLocalDates(selectedDates).map((localDate) => ({
    localDate,
    windows: [...(windowsByDate[localDate] ?? [])].sort((a, b) => {
      if (a.start !== b.start) {
        return a.start.localeCompare(b.start)
      }
      return a.end.localeCompare(b.end)
    }),
  }))

export const buildTimeWindowsCardModel = ({
  selectedDates,
  groups,
}: {
  selectedDates: string[]
  groups: SelectedDateWindowGroup[]
}) => {
  if (!selectedDates.length) {
    return {
      hasSelection: false,
      hasAnyWindows: false,
      helperText: formatNoSelectedWindowsHelper(),
    }
  }

  const hasAnyWindows = groups.some((group) => group.windows.length > 0)

  return {
    hasSelection: true,
    hasAnyWindows,
    helperText: hasAnyWindows ? null : 'No time windows for selected dates.',
  }
}
