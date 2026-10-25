import { describe, expect, it } from 'vitest'

import { resolveOrderPanelWidth } from '../orderPanelWidth'

describe('order panel width', () => {
  it('scales the pre-redesign widths by the factor', () => {
    expect(resolveOrderPanelWidth('desktop', 1)).toBe(450)
    expect(resolveOrderPanelWidth('tablet', 1)).toBe(420)
    expect(resolveOrderPanelWidth('desktop', 0.6)).toBe(270)
    expect(resolveOrderPanelWidth('tablet', 0.6)).toBe(252)
  })
})
