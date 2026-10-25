import { describe, expect, it } from 'vitest'

import type { OrderItemPreview } from '../../types/order'
import { resolveOrderItemPreviewSummary } from '../orderItemPreviewSummary'

const preview = (quantity?: number): OrderItemPreview => ({
  article_number: 'T2-200526',
  item_type: 'parcel',
  quantity: quantity as number,
  image_urls: [],
})

describe('resolveOrderItemPreviewSummary', () => {
  it('handles absent previews', () => {
    expect(resolveOrderItemPreviewSummary(null, 0)).toEqual({ rows: [], extraCount: 0 })
  })

  it('shows no extra label when one unit is previewed', () => {
    const row = preview(1)
    expect(resolveOrderItemPreviewSummary([row], 1)).toEqual({ rows: [row], extraCount: 0 })
  })

  it('subtracts the previewed quantities from the total', () => {
    expect(resolveOrderItemPreviewSummary([preview(2), preview(1)], 7).extraCount).toBe(4)
  })

  it('limits rows before counting covered units', () => {
    expect(resolveOrderItemPreviewSummary([preview(1), preview(2), preview(3)], 6)).toMatchObject({
      rows: [preview(1), preview(2)],
      extraCount: 3,
    })
  })

  it('treats missing quantities as one', () => {
    expect(resolveOrderItemPreviewSummary([preview(undefined)], 3).extraCount).toBe(2)
  })

  it('never reports a negative remainder', () => {
    expect(resolveOrderItemPreviewSummary([preview(4)], 2).extraCount).toBe(0)
  })
})
