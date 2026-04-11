import { useCallback } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { createEntityStore } from "@shared-store"
import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { Item, ItemMap } from '../types'

export const useItemStore = createEntityStore<Item>()

type ItemOrderSyncMeta = {
  itemsUpdatedAt: string | null
  lastFetchedAt: number
}

type ItemOrderSyncState = {
  byOrderId: Record<number, ItemOrderSyncMeta>
  setMeta: (orderId: number, meta: ItemOrderSyncMeta) => void
  clearMeta: (orderId: number) => void
  clear: () => void
}

const useItemOrderSyncStore = create<ItemOrderSyncState>((set) => ({
  byOrderId: {},
  setMeta: (orderId, meta) =>
    set((state) => ({
      byOrderId: {
        ...state.byOrderId,
        [orderId]: meta,
      },
    })),
  clearMeta: (orderId) =>
    set((state) => {
      const next = { ...state.byOrderId }
      delete next[orderId]
      return { byOrderId: next }
    }),
  clear: () => set(() => ({ byOrderId: {} })),
}))

export const selectAllItems = (state: EntityTable<Item>) => selectAll<Item>()(state)

export const selectItemByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<Item>) => selectByClientId<Item>(clientId)(state)

export const selectItemByServerId = (id: number | null | undefined) =>
  (state: EntityTable<Item>) => selectByServerId<Item>(id)(state)

export const selectItemsByOrderId = (orderId: number | null | undefined) =>
  (state: EntityTable<Item>) => {
    if (orderId == null) return []

    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .filter((item) => item.order_id === orderId)
  }

export const selectItemsByOrderIds = (orderIds: number[]) =>
  (state: EntityTable<Item>) => {
    if (!orderIds.length) return []
    const orderIdSet = new Set(orderIds)
    return state.allIds
      .map((clientId) => state.byClientId[clientId])
      .filter((item) => orderIdSet.has(item.order_id))
  }

export const useItems = () => useItemStore(useShallow(selectAllItems))

export const useItemByClientId = (clientId: string | null | undefined) =>
  useItemStore(selectItemByClientId(clientId))

export const useItemByServerId = (id: number | null | undefined) =>
  useItemStore(selectItemByServerId(id))

export const useItemsByOrderId = (orderId: number | null | undefined) =>
  useItemStore(useShallow(selectItemsByOrderId(orderId)))

export const useItemsByOrderIds = (orderIds: number[]) =>
  useItemStore(useShallow(selectItemsByOrderIds(orderIds)))

export const setItem = (item: Item) => useItemStore.getState().insert(item)

export const setItems = (table: ItemMap) => useItemStore.getState().insertMany(table)

export const replaceItemsForOrder = (orderId: number, table: ItemMap) =>
  useItemStore.setState((state) => {
    const nextByClientId = { ...state.byClientId }
    const incomingItems: Record<string, Item> = {}
    const incomingIds: string[] = []

    table.allIds.forEach((clientId) => {
      const item = table.byClientId[clientId]
      if (!item || item.order_id !== orderId) {
        return
      }
      incomingItems[clientId] = item
      incomingIds.push(clientId)
    })

    const retainedIds = state.allIds.filter((clientId) => {
      const item = state.byClientId[clientId]
      if (!item || item.order_id !== orderId) {
        return true
      }
      delete nextByClientId[clientId]
      return false
    })

    const dedupedIncomingIds = incomingIds.filter((clientId) => !retainedIds.includes(clientId))
    const mergedAllIds = [...retainedIds, ...dedupedIncomingIds]
    const mergedByClientId = {
      ...nextByClientId,
      ...incomingItems,
    }
    const nextIdIndex: Record<number, string> = {}

    mergedAllIds.forEach((clientId) => {
      const item = mergedByClientId[clientId]
      if (item?.id != null) {
        nextIdIndex[item.id] = item.client_id
      }
    })

    return {
      byClientId: mergedByClientId,
      allIds: mergedAllIds,
      idIndex: nextIdIndex,
    }
  })

export const updateItemByClientId = (clientId: string, updater: (item: Item) => Item) =>
  useItemStore.getState().update(clientId, updater)

export const removeItemByClientId = (clientId: string) => useItemStore.getState().remove(clientId)

export const clearItems = () => {
  useItemStore.getState().clear()
  useItemOrderSyncStore.getState().clear()
}

export const getItemsByOrderId = (orderId: number | null | undefined) => {
  if (orderId == null) return []
  return selectItemsByOrderId(orderId)(useItemStore.getState())
}

export const getItemOrderSyncMeta = (orderId: number | null | undefined) => {
  if (orderId == null) return null
  return useItemOrderSyncStore.getState().byOrderId[orderId] ?? null
}

export const setItemOrderSyncMeta = (orderId: number, meta: ItemOrderSyncMeta) =>
  useItemOrderSyncStore.getState().setMeta(orderId, meta)

export const clearItemOrderSyncMeta = (orderId: number) =>
  useItemOrderSyncStore.getState().clearMeta(orderId)

export const useSetItem = () =>
  useCallback((item: Item) => {
    setItem(item)
  }, [])

export const useSetItems = () =>
  useCallback((table: ItemMap) => {
    setItems(table)
  }, [])

export const useUpdateItem = () =>
  useCallback(
    (clientId: string, updater: (item: Item) => Item) => {
      updateItemByClientId(clientId, updater)
    },
    [],
  )

export const useRemoveItem = () =>
  useCallback((clientId: string) => {
    removeItemByClientId(clientId)
  }, [])
