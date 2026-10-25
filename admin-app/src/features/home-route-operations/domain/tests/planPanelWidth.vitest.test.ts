import { describe, expect, it } from 'vitest'

import { resolvePlanPanelWidth } from '../planPanelWidth'

describe('plan panel width', () => {
  it('is 5% wider than the order panel', () => {
    expect(resolvePlanPanelWidth('tablet', 294)).toBe(309)
    expect(resolvePlanPanelWidth('desktop', 315)).toBe(331)
  })

  it('follows the factor', () => {
    expect(resolvePlanPanelWidth('tablet', 300, 1.1)).toBe(330)
  })
})
