import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { normalizeItemTypeLabelMultiplier } from '../../domain/itemTypeLabelMultiplier'
import { useItemTypeByClientId } from '../../hooks/useItemSelectors'
import { useItemPropertyFlow } from '../../hooks/useItemPropertyFlow'

import { ItemTypeFormContextProvider } from './ItemTypeForm.context'
import type { ItemTypeFormPayload, ItemTypeFormState } from './ItemTypeForm.types'
import { useItemTypeFormWarnings } from './ItemTypeForm.warnings'
import { useItemTypeFormValidation } from './ItemTypeForm.validation'
import { useItemTypeFormSubmit } from './useItemTypeFormSubmit'


const buildInitialForm = (
  name?: string,
  properties?: number[],
  labelMultiplier?: number | null,
) => ({
  name: name ?? '',
  properties: properties ?? [],
  label_multiplier: normalizeItemTypeLabelMultiplier(labelMultiplier),
})

export const ItemTypeFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ItemTypeFormPayload
}) => {
  const existing = useItemTypeByClientId(payload.clientId ?? null)
  useItemPropertyFlow()
  const [formState, setFormState] = useState<ItemTypeFormState>(() =>
    buildInitialForm(
      existing?.name,
      existing?.properties,
      existing?.label_multiplier,
    ),
  )
  const initialFormRef = useRef<ItemTypeFormState | null>(null)
  const warnings = useItemTypeFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(
      existing?.name,
      existing?.properties,
      existing?.label_multiplier,
    )
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing, payload])

  const { validateForm } = useItemTypeFormValidation({ formState, warnings })
  const submitters = useItemTypeFormSubmit({
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
      ...submitters,
    }),
    [formState, payload, submitters, warnings],
  )

  return <ItemTypeFormContextProvider value={value}>{children}</ItemTypeFormContextProvider>
}
