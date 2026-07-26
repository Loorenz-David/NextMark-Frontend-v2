import { createItemTypeLabelMultiplierResolver } from '../itemTypeLabelMultiplier'
import type { ItemType } from '../../types/itemType'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const makeItemType = (
  name: string,
  labelMultiplier: number | null | undefined,
): ItemType => ({
  client_id: `item-type-${name}`,
  name,
  label_multiplier: labelMultiplier,
})

export const runItemTypeLabelMultiplierDomainTests = () => {
  const resolveLabelMultiplier = createItemTypeLabelMultiplierResolver([
    makeItemType('Chair', 2),
    makeItemType('Box', 3),
    makeItemType('Missing multiplier', undefined),
    makeItemType('Zero multiplier', 0),
    makeItemType('Negative multiplier', -2),
    makeItemType('Fractional multiplier', 1.5),
  ])

  assert(
    resolveLabelMultiplier(' chair ') === 2,
    'item-type matching should ignore casing and surrounding whitespace',
  )
  assert(
    resolveLabelMultiplier('BOX') === 3,
    'each item type should resolve its configured multiplier',
  )

  for (const itemTypeName of [
    'Unknown',
    'Missing multiplier',
    'Zero multiplier',
    'Negative multiplier',
    'Fractional multiplier',
  ]) {
    assert(
      resolveLabelMultiplier(itemTypeName) === 1,
      `${itemTypeName} should use the default multiplier`,
    )
  }
}
