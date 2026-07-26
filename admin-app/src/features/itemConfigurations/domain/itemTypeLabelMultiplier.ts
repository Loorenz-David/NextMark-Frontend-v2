import type { ItemType } from '../types/itemType'

export const DEFAULT_ITEM_TYPE_LABEL_MULTIPLIER = 1

const normalizeItemTypeName = (value: string) => value.trim().toLowerCase()

export const normalizeItemTypeLabelMultiplier = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : DEFAULT_ITEM_TYPE_LABEL_MULTIPLIER

export const createItemTypeLabelMultiplierResolver = (
  itemTypes: readonly ItemType[],
) => {
  const multiplierByName = new Map<string, number>()

  for (const itemType of itemTypes) {
    const normalizedName = normalizeItemTypeName(itemType.name)
    if (!normalizedName) continue

    multiplierByName.set(
      normalizedName,
      normalizeItemTypeLabelMultiplier(itemType.label_multiplier),
    )
  }

  return (itemTypeName: string) =>
    multiplierByName.get(normalizeItemTypeName(itemTypeName)) ??
    DEFAULT_ITEM_TYPE_LABEL_MULTIPLIER
}
