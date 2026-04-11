import { isRangeComplete, isWithinRange, normalizeRange } from '../domain/range.utils'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runRangeUtilsTests = () => {
  const a = new Date(2026, 2, 10, 22, 30)
  const b = new Date(2026, 2, 2, 6, 15)

  const normalized = normalizeRange(a, b)

  assert(normalized.start.getDate() === 2, 'normalizeRange should order start date first')
  assert(normalized.end.getDate() === 10, 'normalizeRange should order end date second')

  const start = new Date(2026, 2, 2)
  const end = new Date(2026, 2, 10)

  assert(isWithinRange(new Date(2026, 2, 2), start, end), 'Range start should be included')
  assert(isWithinRange(new Date(2026, 2, 10), start, end), 'Range end should be included')
  assert(!isWithinRange(new Date(2026, 2, 1), start, end), 'Date before range should be excluded')
  assert(!isWithinRange(new Date(2026, 2, 11), start, end), 'Date after range should be excluded')

  assert(isRangeComplete({ start, end }), 'Range with start and end should be complete')
  assert(!isRangeComplete({ start, end: null }), 'Range without end should be incomplete')
}
