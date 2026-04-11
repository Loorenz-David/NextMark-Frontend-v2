import { shiftSingleValueByMode } from '../planDateFilter.utils'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runPlanDateFilterUtilsTests = () => {
  const nextMonth = shiftSingleValueByMode('month', new Date('2026-03-31T12:00:00.000Z'), 'next')

  assert(nextMonth.getUTCFullYear() === 2026, 'month shift should keep the expected year')
  assert(nextMonth.getUTCMonth() === 3, 'month shift from March should move to April')
  assert(nextMonth.getUTCDate() === 1, 'month shift should anchor to the first day of the next month')
}
