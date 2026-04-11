import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { hasFormChanges, makeInitialFormCopy } from '@shared-domain'

import { useItemFlow } from '../../hooks/useItemFlow'
import type { Item, ItemPopupPayload } from '../../types'

import { ItemFormContextProvider } from './ItemForm.context'
import { useItemFormValidation } from './ItemForm.validation'
import { useItemFormWarnings } from './ItemForm.warnings'
import { useItemFormSubmit } from './useItemFormSubmit'
import { useItemFormSetters } from './useItemFormSetters'
import { useItemConfigurations } from './useItemConfigurations'
import { buildInitialItemDraft } from './form/itemForm.factory'

export const ItemFormProvider = ({
  payload,
  children,
  onSuccessClose,
  onUnsavedChangesChange,
}: {
  payload: ItemPopupPayload | undefined
  children: ReactNode
  onSuccessClose?: () => void | Promise<void>
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}) => {
  if (!payload) {
    throw new Error('ItemForm payload is missing.')
  }

  const autonomousItemId = payload.mode === 'autonomous' ? payload.itemId ?? null : null
  const { item: existingItem } = useItemFlow({ itemId: autonomousItemId })

  const [formState, setFormState] = useState<Item>(() =>
    buildInitialItemDraft({ payload, existingItem }),
  )

  const initialFormRef = useRef<Item | null>(null)
  const warnings = useItemFormWarnings()
  const selectedItemTypeName = formState.item_type
  const {
    itemTypeOptions, 
    selectedItemTypeProperties, 
  } = useItemConfigurations({ selectedItemTypeName })

  const setters = useItemFormSetters({
      setFormState,
      warnings,
    })

  useEffect(() => {
    const initialDraft = buildInitialItemDraft({ payload, existingItem })
    setFormState(initialDraft)
    makeInitialFormCopy(initialFormRef, initialDraft)
  }, [autonomousItemId, existingItem, payload])

  const hasUnsavedChanges = hasFormChanges(formState, initialFormRef)
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onUnsavedChangesChange])

  const { validateForm } = useItemFormValidation({ formState, warnings })

  const submitters = useItemFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
    onSuccessClose,
  })

  const value = useMemo(
    () => ({
      payload,
      setters,
      currentItem: existingItem,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      hasUnsavedChanges,
      itemTypeOptions, 
      selectedItemTypeProperties, 
      ...submitters,
    }),
    [
      existingItem,
      formState,
      hasUnsavedChanges,
      itemTypeOptions,
      payload,
      selectedItemTypeProperties,
      setters,
      submitters,
      warnings,
    ],
  )

  return <ItemFormContextProvider value={value}>{children}</ItemFormContextProvider>
}
