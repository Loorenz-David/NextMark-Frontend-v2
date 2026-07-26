import { useCallback, useState } from 'react'

import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { useGetItemsByOrderIds, useGetOrderItems } from '../api/item.api'
import { useItemModel } from '../domain/useItemModel'
import type { Item, ItemMap } from '../types'
import {
  getItemOrderSyncMeta,
  getItemsByOrderId,
  replaceItemsForOrder,
  setItemOrderSyncMeta,
  useItemByClientId,
  useItemsByOrderId,
} from '../store/item.store'

export const ITEMS_CACHE_TTL_MS = 5 * 60 * 1000
// Per-request page size for the batched fetch. The endpoint defaults to 50, so
// callers should size their limit to the expected item count; this is the floor.
export const ITEMS_BATCH_DEFAULT_LIMIT = 500
// Backstop against a runaway pagination loop; each page is `limit` items.
const ITEMS_BATCH_MAX_PAGES = 50
const inFlightItemsByOrderId = new Map<number, Promise<ItemMap | null>>()

const buildItemMap = (items: Item[]): ItemMap => {
  const byClientId: Record<string, Item> = {}
  const allIds: string[] = []
  for (const item of items) {
    byClientId[item.client_id] = item
    allIds.push(item.client_id)
  }
  return { byClientId, allIds }
}

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
  const getItemsByOrderIds = useGetItemsByOrderIds()
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

  // Batched replacement for calling loadItemsByOrderId once per order. Fetches
  // every requested order's items in one request (following cursor pagination),
  // buckets the flat response by order_id, and writes each order to the store —
  // including orders that returned no items, so they are not refetched.
  const loadItemsByOrderIds = useCallback(
    async (
      orderIds: number[],
      options?: {
        limit?: number
        itemsUpdatedAtByOrderId?: Record<number, string | null>
      },
    ) => {
      const uniqueOrderIds = Array.from(
        new Set(orderIds.filter((orderId) => Number.isFinite(orderId) && orderId > 0)),
      )
      if (uniqueOrderIds.length === 0) return

      const limit = Math.max(options?.limit ?? ITEMS_BATCH_DEFAULT_LIMIT, 1)
      setIsLoadingItems(true)

      const collected: Item[] = []
      try {
        let afterId: number | undefined
        for (let page = 0; page < ITEMS_BATCH_MAX_PAGES; page += 1) {
          const response = await getItemsByOrderIds(uniqueOrderIds, {
            limit,
            after_id: afterId,
          })
          const payload = response.data
          // `items` is an ItemMap spanning all requested orders; each entry
          // carries its own order_id, so we flatten and bucket by that below.
          const byClientId = payload?.items?.byClientId
          if (byClientId) {
            collected.push(...Object.values(byClientId))
          }
          const pagination = payload?.items_pagination
          if (!pagination?.has_more || pagination.next_cursor == null) break
          afterId = pagination.next_cursor.after_id
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load items.'
        const status = error instanceof ApiError ? error.status : 500
        showMessage({ status, message })
        return null
      } finally {
        setIsLoadingItems(false)
      }

      const itemsByOrderId = new Map<number, Item[]>()
      for (const item of collected) {
        const bucketOrderId = item.order_id
        if (!Number.isFinite(bucketOrderId) || bucketOrderId <= 0) continue
        const bucket = itemsByOrderId.get(bucketOrderId) ?? []
        bucket.push(item)
        itemsByOrderId.set(bucketOrderId, bucket)
      }

      const lastFetchedAt = Date.now()
      for (const targetOrderId of uniqueOrderIds) {
        const normalized = normalizeItemsForOrder(
          buildItemMap(itemsByOrderId.get(targetOrderId) ?? []),
          targetOrderId,
        )
        replaceItemsForOrder(targetOrderId, normalized)
        setItemOrderSyncMeta(targetOrderId, {
          itemsUpdatedAt: options?.itemsUpdatedAtByOrderId?.[targetOrderId] ?? null,
          lastFetchedAt,
        })
      }

      return itemsByOrderId
    },
    [getItemsByOrderIds, normalizeItemsForOrder, showMessage],
  )

  return {
    items,
    item,
    isLoadingItems,
    loadItemsByOrderId,
    loadItemsByOrderIds,
  }
}
