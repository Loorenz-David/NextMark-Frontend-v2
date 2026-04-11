import { useShallow } from 'zustand/react/shallow'

import { selectAllItemTypes, useItemTypeStore } from '../store/itemTypeStore'
import { selectAllItemProperties, useItemPropertyStore } from '../store/itemPropertyStore'
import { useItemTypeFlow } from './useItemTypeFlow'
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
