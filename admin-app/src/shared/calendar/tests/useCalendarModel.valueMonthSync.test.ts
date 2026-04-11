import {
  resolveAnchorDateWithFallback,
  resolveVisibleMonthSyncAction,
} from '../model/useCalendarModel'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runUseCalendarModelValueMonthSyncTests = () => {
  const fallbackToday = new Date(2026, 2, 2)
  const currentMonth = new Date(2026, 2, 1)

  const anchor = resolveAnchorDateWithFallback(
    'single',
    new Date(2026, 4, 6),
    fallbackToday,
  )
  const anchorMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1)

  const uncontrolledAction = resolveVisibleMonthSyncAction({
    isMonthControlled: false,
    hasOnVisibleMonthChange: false,
    currentVisibleMonth: currentMonth,
    nextVisibleMonth: anchorMonth,
  })

  assert(uncontrolledAction === 'state', 'Uncontrolled month should auto-sync to value anchor month')

  const controlledAction = resolveVisibleMonthSyncAction({
    isMonthControlled: true,
    hasOnVisibleMonthChange: true,
    currentVisibleMonth: currentMonth,
    nextVisibleMonth: anchorMonth,
  })

  assert(controlledAction === 'callback', 'Controlled month should request parent sync callback')
}
