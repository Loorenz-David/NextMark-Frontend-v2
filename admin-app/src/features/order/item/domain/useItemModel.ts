import { useCallback, useMemo } from 'react'

import type { Item, ItemMap } from '../types'

const isItemMap = (value: ItemMap | Item): value is ItemMap =>
  Boolean((value as ItemMap).byClientId && (value as ItemMap).allIds)

export const useItemModel = () => {
  const normalizeItemPayload = useCallback((payload: ItemMap | Item): ItemMap => {
    if (isItemMap(payload)) {
      return payload
    }

    return {
      byClientId: { [payload.client_id]: payload },
      allIds: [payload.client_id],
    }
  }, [])

  const normalizeItemsForOrder = useCallback((payload: ItemMap, orderId: number): ItemMap => {
    const byClientId: Record<string, Item> = {}
    const allIds: string[] = []

    payload.allIds.forEach((clientId) => {
      const item = payload.byClientId[clientId]
      if (!item) return

      const normalizedItem: Item = {
        ...item,
        order_id: item.order_id ?? orderId,
      }

      if (!Number.isFinite(normalizedItem.order_id) || normalizedItem.order_id <= 0) return

      byClientId[normalizedItem.client_id] = normalizedItem
      allIds.push(normalizedItem.client_id)
    })

    return {
      byClientId,
      allIds,
    }
  }, [])

  return useMemo(
    () => ({
      normalizeItemPayload,
      normalizeItemsForOrder,
    }),
    [normalizeItemPayload, normalizeItemsForOrder],
  )
}
