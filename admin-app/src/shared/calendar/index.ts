export { normalizeToCalendarDay } from './domain/normalize.utils'
export { getCalendarDayKey } from './domain/dayKey.utils'
export {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  addDays,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
} from './domain/date.utils'
export { buildMonthMatrix } from './domain/monthMatrix.builder'
export { normalizeRange, isWithinRange, isRangeComplete } from './domain/range.utils'

export {
  useCalendarModel,
  normalizeCalendarValue,
  resolveValueAnchorDate,
  resolveAnchorDateWithFallback,
  resolveFocusDayKey,
  isSelectionValueControlled,
  isVisibleMonthControlled,
  resolveVisibleMonthSyncAction,
  shouldUseRangePreview,
} from './model/useCalendarModel'
export { selectSingle, selectRange, selectMultiple, selectByMode } from './model/selection.machine'
export {
  validateCalendarValueForMode,
  describeCalendarValueShape,
  isDate,
  isRangeValue,
  isMultipleValue,
} from './model/validation.utils'
export { CalendarProvider, useCalendarContext } from './model/CalendarContext'

export { CalendarRoot } from './ui/CalendarRoot'
export { CalendarHeader } from './ui/CalendarHeader'
export { CalendarGrid } from './ui/CalendarGrid'
export { CalendarWeekRow } from './ui/CalendarWeekRow'
export {
  CalendarDayCell,
  isSelectionActivationKey,
  buildDayCellKeyDownHandler,
} from './ui/CalendarDayCell'

export { CalendarSandboxExample } from './examples/CalendarSandboxExample'

export type {
  CalendarSelectionMode,
  CalendarRangeValue,
  CalendarValue,
  UseCalendarModelProps,
  CalendarValidationResult,
  CalendarModel,
  DayRenderParams,
  CalendarRootProps,
} from './model/calendar.types'
export type { CalendarDay } from './domain/monthMatrix.builder'
