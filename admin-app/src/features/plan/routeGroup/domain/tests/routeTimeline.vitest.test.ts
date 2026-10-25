import { describe, expect, it } from 'vitest'

import { resolveRouteTimelineTime } from '../routeTimeline.domain'

const fixedLabel = (label: string) => () => label

describe('resolveRouteTimelineTime', () => {
  it('shows a time on the plan day', () => {
    expect(resolveRouteTimelineTime('2026-10-25T09:45:00Z', fixedLabel('09:45'))).toEqual({
      status: 'time',
      time: '09:45',
      day: null,
    })
  })

  it('stacks the day over the time on another day', () => {
    expect(resolveRouteTimelineTime('2026-10-26T09:45:00Z', fixedLabel('Oct 26 - 09:45'))).toEqual({
      status: 'time',
      time: '09:45',
      day: 'Oct 26',
    })
  })

  it('reports a time the server is still recalculating', () => {
    const formatLabel = () => {
      throw new Error('a loading time is never formatted')
    }
    expect(resolveRouteTimelineTime('loading', formatLabel)).toEqual({ status: 'loading' })
  })

  it('shows no time when the stop has none or it cannot be read', () => {
    expect(resolveRouteTimelineTime(null, fixedLabel('09:45'))).toEqual({ status: 'none' })
    expect(resolveRouteTimelineTime(undefined, fixedLabel('09:45'))).toEqual({ status: 'none' })
    expect(resolveRouteTimelineTime('', fixedLabel('09:45'))).toEqual({ status: 'none' })
    expect(resolveRouteTimelineTime('not a date', fixedLabel('--'))).toEqual({ status: 'none' })
  })
})
