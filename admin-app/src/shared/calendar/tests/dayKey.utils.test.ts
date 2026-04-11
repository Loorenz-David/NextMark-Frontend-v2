import { getCalendarDayKey } from '../domain/dayKey.utils'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runDayKeyUtilsTests = () => {
  const morning = new Date(2026, 2, 2, 1, 30)
  const evening = new Date(2026, 2, 2, 23, 59)

  const morningKey = getCalendarDayKey(morning)
  const eveningKey = getCalendarDayKey(evening)

  assert(morningKey === '2026-03-02', 'Day key should be YYYY-MM-DD and month padded')
  assert(morningKey === eveningKey, 'Day key should ignore timestamp differences')
}
