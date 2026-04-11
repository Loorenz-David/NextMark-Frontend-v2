import { useCallback, useMemo, useState } from 'react'

import type { useOrderItemDraftController } from '../../../item'
import type { Item, ItemPopupPayload } from '../../../item'

type ItemDraftEditorControllerApi = Pick<
  ReturnType<typeof useOrderItemDraftController>,
  'createItem' | 'updateItem' | 'deleteItem'
>

export const useOrderFormItemEditorActions = ({
  itemDraftController,
  effectiveDraftOrderId,
}: {
  itemDraftController: ItemDraftEditorControllerApi
  effectiveDraftOrderId: number
}) => {
  const { createItem, updateItem, deleteItem } = itemDraftController
  const [editorItem, setEditorItem] = useState<Item | null>(null)
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false)

  const closeItemEditor = useCallback(() => {
    setEditorItem(null)
    setIsItemEditorOpen(false)
  }, [])

  const openItemCreateForm = useCallback(() => {
    setEditorItem(null)
    setIsItemEditorOpen(true)
  }, [])

  const openItemEditForm = useCallback((item: Item) => {
    setEditorItem(item)
    setIsItemEditorOpen(true)
  }, [])

  const itemEditorPayload = useMemo<ItemPopupPayload | undefined>(() => {
    if (!isItemEditorOpen) {
      return undefined
    }

    if (!editorItem) {
      return {
        mode: 'controlled',
        orderId: effectiveDraftOrderId,
        onSubmit: (draft) => {
          createItem({
            ...draft,
            order_id: draft.order_id ?? effectiveDraftOrderId,
          })
        },
      }
    }

    return {
      mode: 'controlled',
      orderId: effectiveDraftOrderId,
      initialItem: editorItem,
      onSubmit: (draft) => {
        updateItem(editorItem.client_id, {
          ...draft,
          id: draft.id ?? editorItem.id,
          client_id: editorItem.client_id,
          order_id: draft.order_id ?? editorItem.order_id ?? effectiveDraftOrderId,
        })
      },
      onDelete: (clientId) => {
        deleteItem(clientId)
      },
    }
  }, [createItem, deleteItem, editorItem, effectiveDraftOrderId, isItemEditorOpen, updateItem])

  return {
    isItemEditorOpen,
    itemEditorPayload,
    openItemCreateForm,
    openItemEditForm,
    closeItemEditor,
  }
}
