import type { RefObject } from 'react'
import { useCallback } from 'react'

import { useItemConfigActions } from '../../hooks/useItemConfigActions'
import { useItemPropertyByClientId } from '../../hooks/useItemSelectors'
import { upsertItemProperty, removeItemProperty } from '../../store/itemPropertyStore'
import { upsertItemType, useItemTypeStore } from '../../store/itemTypeStore'
import { useCreateItemProperty, useUpdateItemProperty, useDeleteItemProperty } from '../../api/itemPropertyApi'
import { useItemConfigFormSubmit } from '../shared/useItemConfigFormSubmit'
import type { ItemProperty, ItemPropertyPayload } from '../../types/itemProperty'
import type { ItemPropertyFormPayload, ItemPropertyFormState } from './ItemPropertyForm.types'

/** Sync all ItemType store records to reflect the updated property's `item_types` list. */
const syncTypesToProperty = (savedProp: ItemProperty) => {
  if (!savedProp.id) return
  const allTypes = Object.values(useItemTypeStore.getState().byClientId)
  const linkedTypeIds = savedProp.item_types ?? []
  for (const type of allTypes) {
    if (!type.id) continue
    const isLinked = linkedTypeIds.includes(type.id)
    const currentProps = type.properties ?? []
    const alreadyLinked = currentProps.includes(savedProp.id)
    if (isLinked && !alreadyLinked) {
      upsertItemType({ ...type, properties: [...currentProps, savedProp.id] })
    } else if (!isLinked && alreadyLinked) {
      upsertItemType({ ...type, properties: currentProps.filter((p) => p !== savedProp.id) })
    }
  }
}

/** Remove a deleted property's ID from all ItemType store records. */
const cleanupDeletedProperty = (deletedProp: ItemProperty) => {
  if (!deletedProp.id) return
  const allTypes = Object.values(useItemTypeStore.getState().byClientId)
  for (const type of allTypes) {
    if (!type.properties?.includes(deletedProp.id)) continue
    upsertItemType({ ...type, properties: type.properties.filter((p) => p !== deletedProp.id) })
  }
}

export const useItemPropertyFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: ItemPropertyFormPayload
  formState: ItemPropertyFormState
  validateForm: () => boolean
  initialFormRef: RefObject<ItemPropertyFormState | null>
}) => {
  const { closePropertyForm } = useItemConfigActions()
  const existing = useItemPropertyByClientId(payload.clientId ?? null)
  const createItemProperty = useCreateItemProperty()
  const updateItemProperty = useUpdateItemProperty()
  const deleteItemProperty = useDeleteItemProperty()

  const onSuccess = useCallback((saved: ItemProperty) => syncTypesToProperty(saved), [])
  const onDelete = useCallback((deleted: ItemProperty) => cleanupDeletedProperty(deleted), [])

  return useItemConfigFormSubmit<ItemPropertyPayload, ItemPropertyFormState, ItemProperty>({
    entityPrefix: 'item_property',
    payload,
    formState,
    validateForm,
    initialFormRef,
    existing: existing ?? null,
    buildCreatePayload: (state, clientId) => ({
      client_id: clientId,
      name: state.name,
      field_type: state.field_type,
      options: state.options,
      required: state.required,
      item_types: state.item_types,
    }),
    createApi: createItemProperty,
    updateApi: (id, diff) => updateItemProperty(id, diff),
    deleteApi: deleteItemProperty,
    upsertFn: upsertItemProperty,
    removeFn: removeItemProperty,
    closeForm: closePropertyForm,
    onSuccess,
    onDelete,
  })
}

