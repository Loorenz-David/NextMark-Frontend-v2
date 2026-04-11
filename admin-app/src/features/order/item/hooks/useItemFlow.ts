import { useCallback, useState } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useGetOrderItems } from '../api/item.api'
import { useItemModel } from '../domain/useItemModel'
import type { ItemMap } from '../types'
import {
  getItemOrderSyncMeta,
  getItemsByOrderId,
  replaceItemsForOrder,
  setItemOrderSyncMeta,
  useItemByClientId,
  useItemsByOrderId,
} from '../store/item.store'

export const ITEMS_CACHE_TTL_MS = 5 * 60 * 1000
const inFlightItemsByOrderId = new Map<number, Promise<ItemMap | null>>()

export const shouldRefreshItemsForOrder = ({
  orderId,
  itemsUpdatedAt,
  expectedItemCount,
}: {
  orderId: number
  itemsUpdatedAt?: string | null
  expectedItemCount?: number | null
}) => {
  const localItems = getItemsByOrderId(orderId)
  const meta = getItemOrderSyncMeta(orderId)
  if (localItems.length === 0) {
    if (!meta) {
      return true
    }
    if (expectedItemCount != null && expectedItemCount > 0) {
      return true
    }
    return Date.now() - meta.lastFetchedAt > ITEMS_CACHE_TTL_MS
  }
  if (expectedItemCount != null && localItems.length !== expectedItemCount) {
    return true
  }
  if (!meta) {
    return true
  }
  if (!itemsUpdatedAt) {
    return Date.now() - meta.lastFetchedAt > ITEMS_CACHE_TTL_MS
  }
  if (meta.itemsUpdatedAt !== itemsUpdatedAt) {
    return true
  }
  if (Date.now() - meta.lastFetchedAt > ITEMS_CACHE_TTL_MS) {
    return true
  }
  return false
}

export const useItemFlow = ({
  orderId,
  itemId,
}: {
  orderId?: number | null
  itemId?: string | null
} = {}) => {
  const getOrderItems = useGetOrderItems()
  const { normalizeItemsForOrder } = useItemModel()
  const { showMessage } = useMessageHandler()
  const items = useItemsByOrderId(orderId ?? null)
  const item = useItemByClientId(itemId ?? null)

  const [isLoadingItems, setIsLoadingItems] = useState(false)

  const loadItemsByOrderId = useCallback(
    async (orderId: number, options?: { itemsUpdatedAt?: string | null }) => {
      if (!Number.isFinite(orderId) || orderId <= 0) {
        showMessage({ status: 400, message: 'Order id is required to load items.' })
        return null
      }

      const existingRequest = inFlightItemsByOrderId.get(orderId)
      if (existingRequest) {
        setIsLoadingItems(true)
        try {
          return await existingRequest
        } finally {
          setIsLoadingItems(false)
        }
      }

      setIsLoadingItems(true)

      const request = (async () => {
        try {
          const response = await getOrderItems(orderId)
          const payload = response.data

          if (!payload?.items) {
            showMessage({ status: 400, message: 'Missing items response.' })
            return null
          }

          const normalized = normalizeItemsForOrder(payload.items, orderId)
          replaceItemsForOrder(orderId, normalized)
          setItemOrderSyncMeta(orderId, {
            itemsUpdatedAt: options?.itemsUpdatedAt ?? null,
            lastFetchedAt: Date.now(),
          })

          return normalized
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Unable to load items.'
          const status = error instanceof ApiError ? error.status : 500
          showMessage({ status, message })
          return null
        }
      })()

      inFlightItemsByOrderId.set(orderId, request)

      try {
        return await request
      } finally {
        inFlightItemsByOrderId.delete(orderId)
        setIsLoadingItems(false)
      }
    },
    [getOrderItems, normalizeItemsForOrder, showMessage],
  )

  return {
    items,
    item,
    isLoadingItems,
    loadItemsByOrderId,
  }
}
