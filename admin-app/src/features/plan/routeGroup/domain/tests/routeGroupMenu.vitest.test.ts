import { describe, expect, it } from 'vitest'

import {
  canMarkRouteGroupReadyForDelivery,
  shouldHighlightRouteOptimization,
} from '../routeGroupMenu.domain'

describe('canMarkRouteGroupReadyForDelivery', () => {
  it('allows an open route group with orders', () => {
    expect(canMarkRouteGroupReadyForDelivery({ stateName: 'Open', orderCount: 3 })).toBe(true)
    expect(canMarkRouteGroupReadyForDelivery({ stateName: ' open ', orderCount: 1 })).toBe(true)
  })

  it('blocks an empty route group', () => {
    expect(canMarkRouteGroupReadyForDelivery({ stateName: 'Open', orderCount: 0 })).toBe(false)
  })

  it('blocks a route group past the open state', () => {
    expect(canMarkRouteGroupReadyForDelivery({ stateName: 'Ready', orderCount: 3 })).toBe(false)
    expect(canMarkRouteGroupReadyForDelivery({ stateName: null, orderCount: 3 })).toBe(false)
  })
})

describe('shouldHighlightRouteOptimization', () => {
  it('highlights a route with stops that is not optimized', () => {
    expect(
      shouldHighlightRouteOptimization({ orderCount: 2, isOptimized: 'not optimize', hasRouteWarnings: false }),
    ).toBe(true)
  })

  it('highlights an optimized route with warnings', () => {
    expect(
      shouldHighlightRouteOptimization({ orderCount: 2, isOptimized: 'optimize', hasRouteWarnings: true }),
    ).toBe(true)
  })

  it('stays quiet for an optimized route without warnings or an empty route', () => {
    expect(
      shouldHighlightRouteOptimization({ orderCount: 2, isOptimized: 'optimize', hasRouteWarnings: false }),
    ).toBe(false)
    expect(
      shouldHighlightRouteOptimization({ orderCount: 0, isOptimized: 'not optimize', hasRouteWarnings: true }),
    ).toBe(false)
  })
})
