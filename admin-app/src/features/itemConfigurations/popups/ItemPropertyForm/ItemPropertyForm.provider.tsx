import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useItemPropertyByClientId } from '../../hooks/useItemSelectors'
import { useItemTypeFlow } from '../../hooks/useItemTypeFlow'

import { ItemPropertyFormContextProvider } from './ItemPropertyForm.context'
import type { ItemPropertyFormPayload, ItemPropertyFormState } from './ItemPropertyForm.types'
import { useItemPropertyFormWarnings } from './ItemPropertyForm.warnings'
import { useItemPropertyFormValidation } from './ItemPropertyForm.validation'
import { useItemPropertyFormSubmit } from './useItemPropertyFormSubmit'
import type { ItemPropertyFieldType } from '../../types/itemProperty'
import { useItemPropertyFormSetters } from './useItemPropertyFormSetters'
import { useItemPropertyFormConfig } from './useItemPropertyFormConfig'
import { usePropertyItemTypeQuery } from './queries/usePropertyItemTypeQuery'

const buildInitialForm = (
  name?: string,
  fieldType?: ItemPropertyFieldType | null,
  options?: string[] | null,
  required?: boolean,
  itemTypes?: number[],
) => ({
  name: name ?? '',
  field_type: fieldType ?? 'text',
  options: options ?? [],
  required: required ?? false,
  item_types: itemTypes ?? [],
})

export const ItemPropertyFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ItemPropertyFormPayload 
}) => {
  const existing = useItemPropertyByClientId(payload.clientId ?? null)
  useItemTypeFlow()
  const [formState, setFormState] = useState<ItemPropertyFormState>(() =>
    buildInitialForm(
      existing?.name,
      existing?.field_type,
      existing?.options,
      existing?.required,
      existing?.item_types,
    ),
  )
  const initialFormRef = useRef<ItemPropertyFormState | null>(null)
  const warnings = useItemPropertyFormWarnings()
  const setters = useItemPropertyFormSetters({ setFormState, warnings })

  const itemTypeQuery = usePropertyItemTypeQuery(formState.item_types)
  
  useItemPropertyFormConfig({ formState, initialFormRef, payload })

  useEffect(() => {
    const initial = buildInitialForm(
      existing?.name,
      existing?.field_type ,
      existing?.options ,
      existing?.required,
      existing?.item_types,
    )
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing?.field_type, existing?.item_types, existing?.name, existing?.options, existing?.required, payload])

  const { validateForm } = useItemPropertyFormValidation({ formState, warnings })
  const submitters = useItemPropertyFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      setters,
      itemTypeQuery,
      ...submitters,
    }),
    [formState, payload, submitters, warnings, setters],
  )

  return <ItemPropertyFormContextProvider value={value}>{children}</ItemPropertyFormContextProvider>
}
