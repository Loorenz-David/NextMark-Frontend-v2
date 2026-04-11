import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import type { ItemType, ItemTypeMap } from '../types/itemType'
import type { ItemProperty, ItemPropertyMap } from '../types/itemProperty'
import type { ItemPosition, ItemPositionMap } from '../types/itemPosition'
import type { ItemState, ItemStateMap } from '../types/itemState'

const normalizeItemTypes = (payload: ItemTypeMap | ItemType | null | undefined) =>
  normalizeEntityMap<ItemType>(payload ?? null)

const normalizeItemProperties = (payload: ItemPropertyMap | ItemProperty | null | undefined) =>
  normalizeEntityMap<ItemProperty>(payload ?? null)

const normalizeItemPositions = (payload: ItemPositionMap | ItemPosition | null | undefined) =>
  normalizeEntityMap<ItemPosition>(payload ?? null)

const normalizeItemStates = (payload: ItemStateMap | ItemState | null | undefined) =>
  normalizeEntityMap<ItemState>(payload ?? null)

const itemModel = { normalizeItemTypes, normalizeItemProperties, normalizeItemPositions, normalizeItemStates }

export const useItemModel = () => itemModel
