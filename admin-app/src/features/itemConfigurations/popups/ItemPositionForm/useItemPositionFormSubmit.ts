import type { RefObject } from 'react'

import { useItemConfigActions } from '../../hooks/useItemConfigActions'
import { useItemPositionByClientId } from '../../hooks/useItemSelectors'
import { upsertItemPosition, removeItemPosition } from '../../store/itemPositionStore'
import { useCreateItemPosition, useUpdateItemPosition, useDeleteItemPosition } from '../../api/itemPositionApi'
import { useItemConfigFormSubmit } from '../shared/useItemConfigFormSubmit'
import type { ItemPosition, ItemPositionPayload } from '../../types/itemPosition'
import type { ItemPositionFormPayload, ItemPositionFormState } from './ItemPositionForm.types'

export const useItemPositionFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemPositionFormPayload
  formState: ItemPositionFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ItemPositionFormState | null>
}) => {
  const { closePositionForm } = useItemConfigActions()
  const existing = useItemPositionByClientId(payload.clientId ?? null)
  const createItemPosition = useCreateItemPosition()
  const updateItemPosition = useUpdateItemPosition()
  const deleteItemPosition = useDeleteItemPosition()

  return useItemConfigFormSubmit<ItemPositionPayload, ItemPositionFormState, ItemPosition>({
    entityPrefix: 'item_position',
    payload,
    formState,
    validateForm,
    initialFormRef,
    existing: existing ?? null,
    buildCreatePayload: (state, clientId) => ({
      client_id: clientId,
      name: state.name,
      description: state.description,
      default: state.default,
      is_system: state.is_system,
    }),
    createApi: createItemPosition,
    updateApi: (id, diff) => updateItemPosition(id, diff),
    deleteApi: deleteItemPosition,
    upsertFn: upsertItemPosition,
    removeFn: removeItemPosition,
    closeForm: closePositionForm,
  })
}

