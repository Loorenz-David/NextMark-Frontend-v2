import { resolveVisibleMonthSyncAction } from '../model/useCalendarModel'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runUseCalendarModelControlledMonthTests = () => {
  const current = new Date(2026, 2, 1)
  const next = new Date(2026, 3, 1)

  const controlledNoCallback = resolveVisibleMonthSyncAction({
    isMonthControlled: true,
    hasOnVisibleMonthChange: false,
    currentVisibleMonth: current,
    nextVisibleMonth: next,
  })

  assert(controlledNoCallback === 'noop', 'Controlled month without callback should be no-op')

  const controlledWithCallback = resolveVisibleMonthSyncAction({
    isMonthControlled: true,
    hasOnVisibleMonthChange: true,
    currentVisibleMonth: current,
    nextVisibleMonth: next,
  })

  assert(controlledWithCallback === 'callback', 'Controlled month with callback should request callback sync')

  const uncontrolled = resolveVisibleMonthSyncAction({
    isMonthControlled: false,
    hasOnVisibleMonthChange: false,
    currentVisibleMonth: current,
    nextVisibleMonth: next,
  })

  assert(uncontrolled === 'state', 'Uncontrolled month should request internal state sync')

  const unchanged = resolveVisibleMonthSyncAction({
    isMonthControlled: false,
    hasOnVisibleMonthChange: false,
    currentVisibleMonth: current,
    nextVisibleMonth: current,
  })

  assert(unchanged === 'noop', 'Same visible month should not trigger sync')
}
