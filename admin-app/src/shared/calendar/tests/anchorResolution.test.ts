import { resolveAnchorDateWithFallback, resolveValueAnchorDate } from '../model/useCalendarModel'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runAnchorResolutionTests = () => {
  const rangeAnchor = resolveValueAnchorDate('range', {
    start: new Date(2026, 2, 3),
    end: new Date(2026, 2, 9),
  })
  assert(rangeAnchor?.getDate() === 3, 'Range anchor should resolve to start date')

  const rangeStartOnly = resolveValueAnchorDate('range', {
    start: new Date(2026, 2, 4),
    end: null,
  })
  assert(rangeStartOnly?.getDate() === 4, 'Incomplete range anchor should resolve to start date')

  const multipleAnchor = resolveValueAnchorDate('multiple', [
    new Date(2026, 2, 7),
    new Date(2026, 2, 9),
  ])
  assert(multipleAnchor?.getDate() === 7, 'Multiple anchor should resolve to first date in insertion order')

  const singleAnchor = resolveValueAnchorDate('single', new Date(2026, 2, 6))
  assert(singleAnchor?.getDate() === 6, 'Single anchor should resolve to value date')

  const fallback = resolveAnchorDateWithFallback('single', null, new Date(2026, 2, 2, 22, 45))
  assert(fallback.getDate() === 2 && fallback.getHours() === 0, 'Fallback anchor should resolve to normalized today')
}
