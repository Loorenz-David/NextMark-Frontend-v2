import { describe, expect, it } from 'vitest'

import { resolveRoutePlanPanelWidth } from '../routePlanPanelWidth'

describe('route plan panel width', () => {
  it('is 5% wider than the order panel', () => {
    expect(resolveRoutePlanPanelWidth('tablet', 294)).toBe(309)
    expect(resolveRoutePlanPanelWidth('desktop', 315)).toBe(331)
  })

  it('follows the factor', () => {
    expect(resolveRoutePlanPanelWidth('tablet', 300, 1.1)).toBe(330)
  })
})
