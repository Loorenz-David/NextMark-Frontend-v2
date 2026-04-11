import { selectByMode } from '../model/selection.machine'
import { resolveVisibleMonthSyncAction } from '../model/useCalendarModel'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runOutsideMonthBehaviorTests = () => {
  const visibleMonth = new Date(2026, 2, 1)
  const outsideMonthDate = new Date(2026, 1, 27)

  const nextSelection = selectByMode('single', null, outsideMonthDate)
  assert(nextSelection instanceof Date, 'Outside-month day should be selectable')

  const uncontrolledSync = resolveVisibleMonthSyncAction({
    isMonthControlled: false,
    hasOnVisibleMonthChange: false,
    currentVisibleMonth: visibleMonth,
    nextVisibleMonth: new Date(2026, 1, 1),
  })

  assert(uncontrolledSync === 'state', 'Outside-month selection should update internal month when uncontrolled')

  const controlledSync = resolveVisibleMonthSyncAction({
    isMonthControlled: true,
    hasOnVisibleMonthChange: true,
    currentVisibleMonth: visibleMonth,
    nextVisibleMonth: new Date(2026, 1, 1),
  })

  assert(controlledSync === 'callback', 'Outside-month selection should request callback when month is controlled')
}
