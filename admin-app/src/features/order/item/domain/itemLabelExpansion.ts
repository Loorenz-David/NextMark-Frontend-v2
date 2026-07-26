type LabelCountItem = {
  item_type: string
  quantity: number
}

const normalizeResolvedMultiplier = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : 1

export const expandItemsByLabelMultiplier = <T extends LabelCountItem>(
  items: readonly T[],
  resolveLabelMultiplier: (itemTypeName: string) => number = () => 1,
): T[] => {
  const expandedItems: T[] = []

  for (const item of items) {
    if (!item.quantity) continue

    const labelCount =
      item.quantity *
      normalizeResolvedMultiplier(resolveLabelMultiplier(item.item_type))

    for (let index = 0; index < labelCount; index += 1) {
      expandedItems.push(item)
    }
  }

  return expandedItems
}
