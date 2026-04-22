import { useShallow } from 'zustand/react/shallow'

import { selectAllItemTypes, useItemTypeStore } from '../store/itemTypeStore'
import { selectAllItemPositions, useItemPositionStore } from '../store/itemPositionStore'
import { selectAllItemProperties, useItemPropertyStore } from '../store/itemPropertyStore'
import { useItemTypeFlow } from './useItemTypeFlow'
import { useItemPositionFlow } from './useItemPositionFlow'
import { useItemPropertyFlow } from './useItemPropertyFlow'

/**
 * Returns all item types from the store. Initial load is handled by
 * useItemTypeFlow's own effect — no extra effect needed here.
 */
export const useItemTypesOrFetch = () => {
  const itemTypes = useItemTypeStore(useShallow(selectAllItemTypes))
  useItemTypeFlow()
  return itemTypes
}

/**
 * Returns all item properties from the store. Initial load is handled by
 * useItemPropertyFlow's own effect — no extra effect needed here.
 */
export const useItemPropertiesOrFetch = () => {
  const itemProperties = useItemPropertyStore(useShallow(selectAllItemProperties))
  useItemPropertyFlow()
  return itemProperties
}

/**
 * Returns all item positions from the store. Initial load is handled by
 * useItemPositionFlow's own effect — no extra effect needed here.
 */
export const useItemPositionsOrFetch = () => {
  const itemPositions = useItemPositionStore(useShallow(selectAllItemPositions))
  useItemPositionFlow()
  return itemPositions
}
