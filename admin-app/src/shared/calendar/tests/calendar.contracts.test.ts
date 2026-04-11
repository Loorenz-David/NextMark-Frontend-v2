import {
  isSelectionValueControlled,
  isVisibleMonthControlled,
} from '../model/useCalendarModel'
import { validateCalendarValueForMode } from '../model/validation.utils'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCalendarContractsTests = () => {
  const validSingle = validateCalendarValueForMode('single', new Date(2026, 2, 2))
  assert(validSingle.isValid, 'Single mode should accept Date')

  const invalidSingle = validateCalendarValueForMode('single', [new Date(2026, 2, 2)])
  assert(!invalidSingle.isValid, 'Single mode should reject Date[]')

  const validMultiple = validateCalendarValueForMode('multiple', [new Date(2026, 2, 2)])
  assert(validMultiple.isValid, 'Multiple mode should accept Date[]')

  const invalidMultiple = validateCalendarValueForMode('multiple', null)
  assert(!invalidMultiple.isValid, 'Multiple mode should reject null')

  const validRange = validateCalendarValueForMode('range', {
    start: new Date(2026, 2, 1),
    end: null,
  })
  assert(validRange.isValid, 'Range mode should accept range shape')

  const readonlyDate = validateCalendarValueForMode('readonly', new Date(2026, 2, 1))
  const readonlyArray = validateCalendarValueForMode('readonly', [new Date(2026, 2, 1)])
  const readonlyRange = validateCalendarValueForMode('readonly', {
    start: new Date(2026, 2, 1),
    end: new Date(2026, 2, 2),
  })

  assert(readonlyDate.isValid, 'Readonly mode should accept Date')
  assert(readonlyArray.isValid, 'Readonly mode should accept Date[]')
  assert(readonlyRange.isValid, 'Readonly mode should accept range value')

  assert(isSelectionValueControlled(null), 'null value should be treated as controlled selection mode')
  assert(!isSelectionValueControlled(undefined), 'undefined value should be treated as uncontrolled selection mode')

  assert(
    isVisibleMonthControlled(new Date(2026, 2, 1)),
    'Date visibleMonth should be treated as controlled month mode',
  )
  assert(!isVisibleMonthControlled(undefined), 'undefined visibleMonth should be uncontrolled month mode')
}
