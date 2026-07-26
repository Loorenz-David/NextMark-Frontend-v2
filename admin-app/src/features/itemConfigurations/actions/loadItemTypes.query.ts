import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'

import { itemTypeApi } from '../api/itemTypeApi'
import type { ItemType, ItemTypeMap } from '../types/itemType'

export const loadItemTypes = async (): Promise<ItemTypeMap> => {
  const response = await itemTypeApi.list()
  const payload = response.data?.item_types

  if (!payload) {
    throw new Error('Missing item types response.')
  }

  const normalized = normalizeEntityMap<ItemType>(payload)
  if (!normalized) {
    throw new Error('Unable to normalize item types response.')
  }

  return normalized
}
