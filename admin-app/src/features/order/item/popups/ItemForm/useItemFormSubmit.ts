import type { RefObject } from 'react'
import { useCallback, useMemo } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { hasFormChanges } from '@shared-domain'

import { normalizeItemPosition } from '../../domain/itemPosition'
import { useItemController } from '../../hooks/useItemController'
import type { Item, ItemPopupPayload } from '../../types'

export const useItemFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
  onSuccessClose,
}: {
  payload: ItemPopupPayload
  formState: Item
  validateForm: () => boolean
  initialFormRef: RefObject<Item | null>
  onSuccessClose?: () => void | Promise<void>
}) => {
  const { showMessage } = useMessageHandler()
  const { saveAutonomousItem, deleteAutonomousItem } = useItemController()

  const canDelete = useMemo(
    () =>
      payload.mode === 'autonomous'
        ? Boolean(payload.itemId)
        : Boolean(payload.initialItem?.client_id && payload.onDelete),
    [payload],
  )

  const normalizeDraft = useCallback(
    (draft: Item): Item => ({
      ...draft,
      item_position: normalizeItemPosition(draft.item_position),
    }),
    [],
  )

  const handleSave = useCallback(async (): Promise<boolean> => {
    const isValid = validateForm()
    if (!isValid) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return false
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return false
    }

    const normalizedFormState = normalizeDraft(formState)
    const normalizedInitialForm = normalizeDraft(initialForm)

    if (payload.mode === 'controlled') {
      payload.onSubmit({
        ...normalizedFormState,
        order_id: payload.orderId,
      })
      await onSuccessClose?.()
      return true
    }

    if (payload.itemId && !hasFormChanges(normalizedFormState, { current: normalizedInitialForm })) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return false
    }

    const saved = await saveAutonomousItem({
      orderId: payload.orderId,
      itemId: payload.itemId,
      draft: {
        ...normalizedFormState,
        order_id: payload.orderId,
      },
    })

    if (!saved) {
      return false
    }

    await onSuccessClose?.()
    return true
  }, [formState, initialFormRef, normalizeDraft, onSuccessClose, payload, saveAutonomousItem, showMessage, validateForm])

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!canDelete) return false

    if (payload.mode === 'controlled') {
      const targetId = payload.initialItem?.client_id
      if (!targetId || !payload.onDelete) return false

      payload.onDelete(targetId)
      await onSuccessClose?.()
      return true
    }

    const targetId = payload.itemId
    if (!targetId) return false

    const deleted = await deleteAutonomousItem(targetId)
    if (!deleted) {
      return false
    }
    await onSuccessClose?.()
    return true
  }, [canDelete, deleteAutonomousItem, onSuccessClose, payload])

  return {
    canDelete,
    handleSave,
    handleDelete,
  }
}
