import { expandItemsByLabelMultiplier } from '../itemLabelExpansion'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const makeItem = (itemType: string, quantity: number) => ({
  client_id: `item-${itemType}`,
  item_type: itemType,
  quantity,
})

export const runItemLabelExpansionDomainTests = () => {
  const expandedItems = expandItemsByLabelMultiplier(
    [
      makeItem('Chair', 3),
      makeItem('Box', 2),
    ],
    (itemTypeName) => itemTypeName === 'Chair' ? 2 : 3,
  )

  assert(
    expandedItems.length === 12,
    'label count should equal each item quantity multiplied by its item-type multiplier',
  )
  assert(
    expandedItems.filter((item) => item.item_type === 'Chair').length === 6,
    'chair labels should use the chair multiplier',
  )
  assert(
    expandedItems.filter((item) => item.item_type === 'Box').length === 6,
    'box labels should use the box multiplier',
  )

  for (const invalidMultiplier of [0, -1, 1.5, Number.NaN]) {
    const fallbackItems = expandItemsByLabelMultiplier(
      [makeItem('Custom', 2)],
      () => invalidMultiplier,
    )

    assert(
      fallbackItems.length === 2,
      `invalid multiplier ${invalidMultiplier} should default to one`,
    )
  }
}
