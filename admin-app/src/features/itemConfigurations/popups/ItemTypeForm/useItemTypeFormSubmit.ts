import type { RefObject } from 'react'
import { useCallback } from 'react'

import { useItemConfigActions } from '../../hooks/useItemConfigActions'
import { useItemTypeByClientId } from '../../hooks/useItemSelectors'
import { upsertItemType, removeItemType } from '../../store/itemTypeStore'
import { upsertItemProperty, useItemPropertyStore } from '../../store/itemPropertyStore'
import { useCreateItemType, useUpdateItemType, useDeleteItemType } from '../../api/itemTypeApi'
import { useItemConfigFormSubmit } from '../shared/useItemConfigFormSubmit'
import type { ItemType, ItemTypePayload } from '../../types/itemType'
import type { ItemTypeFormPayload, ItemTypeFormState } from './ItemTypeForm.types'

/** Sync all ItemProperty store records to reflect the updated type's `properties` list. */
const syncPropertiesToType = (savedType: ItemType) => {
  if (!savedType.id) return
  const allProps = Object.values(useItemPropertyStore.getState().byClientId)
  const linkedPropIds = savedType.properties ?? []
  for (const prop of allProps) {
    if (!prop.id) continue
    const isLinked = linkedPropIds.includes(prop.id)
    const currentTypes = prop.item_types ?? []
    const alreadyLinked = currentTypes.includes(savedType.id)
    if (isLinked && !alreadyLinked) {
      upsertItemProperty({ ...prop, item_types: [...currentTypes, savedType.id] })
    } else if (!isLinked && alreadyLinked) {
      upsertItemProperty({ ...prop, item_types: currentTypes.filter((t) => t !== savedType.id) })
    }
  }
}

/** Remove a deleted type's ID from all ItemProperty store records. */
const cleanupDeletedType = (deletedType: ItemType) => {
  if (!deletedType.id) return
  const allProps = Object.values(useItemPropertyStore.getState().byClientId)
  for (const prop of allProps) {
    if (!prop.item_types?.includes(deletedType.id)) continue
    upsertItemProperty({ ...prop, item_types: prop.item_types.filter((t) => t !== deletedType.id) })
  }
}

export const useItemTypeFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemTypeFormPayload
  formState: ItemTypeFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ItemTypeFormState | null>
}) => {
  const { closeTypeForm } = useItemConfigActions()
  const existing = useItemTypeByClientId(payload.clientId ?? null)
  const createItemType = useCreateItemType()
  const updateItemType = useUpdateItemType()
  const deleteItemType = useDeleteItemType()

  const onSuccess = useCallback((saved: ItemType) => syncPropertiesToType(saved), [])
  const onDelete = useCallback((deleted: ItemType) => cleanupDeletedType(deleted), [])

  return useItemConfigFormSubmit<ItemTypePayload, ItemTypeFormState, ItemType>({
    entityPrefix: 'item_type',
    payload,
    formState,
    validateForm,
    initialFormRef,
    existing: existing ?? null,
    buildCreatePayload: (state, clientId) => ({
      client_id: clientId,
      name: state.name,
      properties: state.properties,
    }),
    createApi: createItemType,
    updateApi: (id, diff) => updateItemType(id, diff),
    deleteApi: deleteItemType,
    upsertFn: upsertItemType,
    removeFn: removeItemType,
    closeForm: closeTypeForm,
    onSuccess,
    onDelete,
  })
}

