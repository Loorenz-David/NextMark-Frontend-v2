import { describe, expect, it } from 'vitest'

import {
  findTimelineItemPosition,
  limitTimelineGroups,
  type OrderEventTimelineGroupViewModel,
  type OrderEventTimelineItemViewModel,
} from '../orderEventTimeline.domain'

const item = (clientId: string) =>
  ({ clientId }) as OrderEventTimelineItemViewModel

const groups: OrderEventTimelineGroupViewModel[] = [
  { key: '2026-10-25', label: 'Today', items: [item('a'), item('b')] },
  { key: '2026-10-24', label: 'Yesterday', items: [item('c'), item('d'), item('e')] },
  { key: '2026-10-20', label: 'Oct 20', items: [item('f')] },
]

describe('limitTimelineGroups', () => {
  it('keeps the newest items across groups and counts the rest', () => {
    const result = limitTimelineGroups(groups, 3)

    expect(result.groups.map((group) => group.items.map((entry) => entry.clientId))).toEqual([
      ['a', 'b'],
      ['c'],
    ])
    expect(result.hiddenCount).toBe(3)
  })

  it('returns every group untouched when the limit covers them', () => {
    const result = limitTimelineGroups(groups, 10)

    expect(result.groups).toEqual(groups)
    expect(result.groups[0]).toBe(groups[0])
    expect(result.hiddenCount).toBe(0)
  })

  it('handles an empty history', () => {
    expect(limitTimelineGroups([], 5)).toEqual({ groups: [], hiddenCount: 0 })
  })
})

describe('findTimelineItemPosition', () => {
  it('finds the display position across groups', () => {
    expect(findTimelineItemPosition(groups, 'd')).toBe(3)
  })

  it('returns -1 for a missing or empty id', () => {
    expect(findTimelineItemPosition(groups, 'zz')).toBe(-1)
    expect(findTimelineItemPosition(groups, null)).toBe(-1)
  })
})
