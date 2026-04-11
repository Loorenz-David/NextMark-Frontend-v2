import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateItemState, useUpdateItemState, useDeleteItemState } from '../../api/itemStateApi'
import { useItemStateByClientId, useItemStates } from '../../hooks/useItemSelectors'
import { useItemConfigActions } from '../../hooks/useItemConfigActions'
import { upsertItemState, removeItemState } from '../../store/itemStateStore'
import type { ItemStatePayload } from '../../types/itemState'
import type { ItemStateEntryPoints } from '../../types/itemState'

import type { ItemStateFormPayload, ItemStateFormState } from './ItemStateForm.types'

export const useItemStateFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemStateFormPayload
  formState: ItemStateFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<ItemStateFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createItemState = useCreateItemState()
  const updateItemState = useUpdateItemState()
  const deleteItemState = useDeleteItemState()
  const states = useItemStates()
  const existing = useItemStateByClientId(payload.clientId ?? null)
  const { closeStateForm } = useItemConfigActions()

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initial = initialFormRef.current
    if (!initial) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    const maxIndex = Math.max(
      0,
      ...states
        .filter((state) => !state.is_system && typeof state.index === 'number')
        .map((state) => state.index as number),
    )

    const createPayload: ItemStatePayload = {
      client_id: existing?.client_id ?? buildClientId('item_state'),
      name: formState.name,
      color: formState.color,
      description: formState.description,
      index: maxIndex + 1,
    }

    if (payload.mode === 'create') {
      const optimistic = {
        ...createPayload,
        entry_point: (createPayload.entry_point ?? null) as ItemStateEntryPoints | null,
      }
      // Optimistic insert
      upsertItemState(optimistic)

      try {
        const response = await createItemState(createPayload)
        const serverId = response.data?.[createPayload.client_id]
        if (typeof serverId === 'number') {
          upsertItemState({ ...optimistic, id: serverId })
        }
        closeStateForm()
      } catch (error) {
        console.error('Failed to create item state', error)
        removeItemState(createPayload.client_id)
        showMessage({ status: 500, message: 'Unable to create item state.' })
      }
    } else if (existing?.id) {
      const diff = getObjectDiff(initial, formState)
      const allowedFields = new Set([
        'client_id',
        'name',
        'color',
        'description',
        'index',
      ])
      const safeDiff: Record<string, unknown> = Object.fromEntries(
        Object.entries(diff).filter(([key]) => allowedFields.has(key)),
      )
      if ('index' in safeDiff) {
        const parsedIndex = Number(safeDiff.index)
        safeDiff.index = Number.isNaN(parsedIndex) ? null : parsedIndex
      }

      const nextItem = {
        ...existing,
        ...(safeDiff as Partial<typeof existing>),
        index:
          typeof safeDiff.index === 'number' || safeDiff.index === null
            ? safeDiff.index
            : existing.index ?? null,
      }
      const snapshot = { ...existing }

      // Optimistic update
      upsertItemState(nextItem as never)

      try {
        await updateItemState(existing.id, safeDiff)
        closeStateForm()
      } catch (error) {
        console.error('Failed to update item state', error)
        upsertItemState(snapshot as never)
        showMessage({ status: 500, message: 'Unable to update item state.' })
      }
    }
  }, [
    closeStateForm,
    createItemState,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    removeItemState,
    showMessage,
    states,
    updateItemState,
    validateForm,
  ])

  const handleDelete = useCallback(async () => {
    if (!existing?.id || existing.is_system) return

    const snapshot = { ...existing }
    removeItemState(existing.client_id)

    try {
      await deleteItemState(existing.id)
      closeStateForm()
    } catch (error) {
      console.error('Failed to delete item state', error)
      upsertItemState(snapshot as never)
      showMessage({ status: 500, message: 'Unable to delete item state.' })
    }
  }, [closeStateForm, deleteItemState, existing, removeItemState, showMessage])

  return { handleSave, handleDelete }
}

