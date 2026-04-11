import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { Item, ItemPopupPayload } from '../types'

export const useItemActions = () => {
  const popupManager = usePopupManager()

  const openCreateItem = useCallback(
    (orderId: number) => {
      popupManager.open({
        key: 'order.item.create',
        payload: {
          mode: 'autonomous',
          orderId,
        } satisfies ItemPopupPayload,
      })
    },
    [popupManager],
  )

  const openEditItem = useCallback(
    (orderId: number, itemId: string) => {
      popupManager.open({
        key: 'order.item.edit',
        payload: {
          mode: 'autonomous',
          orderId,
          itemId,
        } satisfies ItemPopupPayload,
      })
    },
    [popupManager],
  )

  const openControlledItemForm = useCallback(
    ({
      orderId,
      initialItem,
      onSubmit,
      onDelete,
    }: {
      orderId: number
      initialItem?: Item
      onSubmit: (draft: Item) => void
      onDelete?: (itemId: string) => void
    }) => {
      const key = initialItem ? 'order.item.edit' : 'order.item.create'

      popupManager.open({
        key,
        payload: {
          mode: 'controlled',
          orderId,
          initialItem,
          onSubmit,
          onDelete,
        } satisfies ItemPopupPayload,
      })
    },
    [popupManager],
  )

  return {
    openCreateItem,
    openEditItem,
    openControlledItemForm,
  }
}
