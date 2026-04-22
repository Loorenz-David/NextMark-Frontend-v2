import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Item } from '../types'

export type OrderItemDraftStatus = 'created' | 'updated' | 'unchanged' | 'deleted'

export type OrderItemDraftState = {
  byClientId: Record<
    string,
    {
      data: Item
      status: OrderItemDraftStatus
    }
  >
}

const toItemDraft = (item: Item): Item => ({
  id: item.id,
  order_id: item.order_id,
  client_id: item.client_id,
  article_number: item.article_number,
  reference_number: item.reference_number ?? null,
  item_type: item.item_type,
  item_position: item.item_position ?? null,
  properties: item.properties ?? null,
  page_link: item.page_link ?? null,
  dimension_depth: item.dimension_depth ?? null,
  dimension_height: item.dimension_height ?? null,
  dimension_width: item.dimension_width ?? null,
  weight: item.weight ?? null,
  quantity: item.quantity,
})

const areDraftsEqual = (left: Item, right: Item) =>
  JSON.stringify(left) === JSON.stringify(right)

const buildInitialState = ({
  mode,
  initialItems,
}: {
  mode: 'create' | 'edit'
  initialItems?: Item[]
}): OrderItemDraftState => {
  if (mode === 'create') {
    return { byClientId: {} }
  }

  return {
    byClientId: (initialItems ?? []).reduce<OrderItemDraftState['byClientId']>((acc, item) => {
      const draft = toItemDraft(item)
      acc[draft.client_id] = {
        data: draft,
        status: 'unchanged',
      }
      return acc
    }, {}),
  }
}

const buildInitialItemsSignature = ({
  mode,
  initialItems,
}: {
  mode: 'create' | 'edit'
  initialItems?: Item[]
}) => {
  if (mode === 'create') {
    return 'create'
  }

  return JSON.stringify((initialItems ?? []).map((item) => toItemDraft(item)))
}

export const useOrderItemDraftController = ({
  mode,
  initialItems,
}: {
  mode: 'create' | 'edit'
  initialItems?: Item[]
}) => {
  const initialItemsSignature = useMemo(
    () => buildInitialItemsSignature({ mode, initialItems }),
    [initialItems, mode],
  )

  const stableInitialItems = useMemo(
    () =>
      mode === 'create'
        ? []
        : (initialItems ?? []).map((item) => toItemDraft(item)),
    [initialItemsSignature, mode],
  )

  const initialState = useMemo(
    () => buildInitialState({ mode, initialItems: stableInitialItems }),
    [mode, stableInitialItems],
  )

  const initialByClientId = useMemo(
    () =>
      Object.values(initialState.byClientId).reduce<Record<string, Item>>((acc, entry) => {
        acc[entry.data.client_id] = entry.data
        return acc
      }, {}),
    [initialState.byClientId],
  )

  const [state, setState] = useState<OrderItemDraftState>(initialState)

  useEffect(() => {
    setState(initialState)
  }, [initialState])

  const visibleItems = useMemo(
    () =>
      Object.values(state.byClientId)
        .filter((entry) => entry.status !== 'deleted')
        .map((entry) => entry.data),
    [state.byClientId],
  )

  const createItem = useCallback((draft: Item) => {
    setState((prev) => ({
      byClientId: {
        ...prev.byClientId,
        [draft.client_id]: {
          data: draft,
          status: 'created',
        },
      },
    }))
  }, [])

  const updateItem = useCallback(
    (clientId: string, draft: Item) => {
      setState((prev) => {
        const current = prev.byClientId[clientId]
        if (!current) {
          return {
            byClientId: {
              ...prev.byClientId,
              [clientId]: {
                data: draft,
                status: 'created',
              },
            },
          }
        }

        if (current.status === 'created') {
          return {
            byClientId: {
              ...prev.byClientId,
              [clientId]: {
                data: draft,
                status: 'created',
              },
            },
          }
        }

        const initialDraft = initialByClientId[clientId]
        const nextStatus: OrderItemDraftStatus =
          initialDraft && areDraftsEqual(initialDraft, draft) ? 'unchanged' : 'updated'

        return {
          byClientId: {
            ...prev.byClientId,
            [clientId]: {
              data: draft,
              status: nextStatus,
            },
          },
        }
      })
    },
    [initialByClientId],
  )

  const deleteItem = useCallback((clientId: string) => {
    setState((prev) => {
      const current = prev.byClientId[clientId]
      if (!current) return prev

      if (current.status === 'created') {
        const rest = { ...prev.byClientId }
        delete rest[clientId]
        return { byClientId: rest }
      }

      return {
        byClientId: {
          ...prev.byClientId,
          [clientId]: {
            data: current.data,
            status: 'deleted',
          },
        },
      }
    })
  }, [])

  const getCreatedItems = useCallback(
    () =>
      Object.values(state.byClientId)
        .filter((entry) => entry.status === 'created')
        .map((entry) => entry.data),
    [state.byClientId],
  )

  const getUpdatedItems = useCallback(
    () =>
      Object.values(state.byClientId)
        .filter((entry) => entry.status === 'updated')
        .map((entry) => entry.data),
    [state.byClientId],
  )

  const getDeletedItems = useCallback(
    () =>
      Object.values(state.byClientId)
        .filter((entry) => entry.status === 'deleted')
        .map((entry) => entry.data.client_id),
    [state.byClientId],
  )

  const reset = useCallback(() => {
    setState(initialState)
  }, [initialState])

  return {
    visibleItems,
    createItem,
    updateItem,
    deleteItem,
    getCreatedItems,
    getUpdatedItems,
    getDeletedItems,
    reset,
  }
}
