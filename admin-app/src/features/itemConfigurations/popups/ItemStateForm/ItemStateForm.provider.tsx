import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useItemStateByClientId } from '../../hooks/useItemSelectors'

import { ItemStateFormContextProvider } from './ItemStateForm.context'
import type { ItemStateFormPayload, ItemStateFormState } from './ItemStateForm.types'
import { useItemStateFormWarnings } from './ItemStateForm.warnings'
import { useItemStateFormValidation } from './ItemStateForm.validation'
import { useItemStateFormSubmit } from './useItemStateFormSubmit'

const buildInitialForm = (
  payload: ItemStateFormPayload,
  name?: string,
  color?: string | null,
  description?: string | null,
  index?: number | null,
) => ({
  name: name ?? '',
  color: color ?? '',
  description: description ?? '',
  index: index !== null && index !== undefined ? String(index) : '',
})

export const ItemStateFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ItemStateFormPayload
}) => {
  const existing = useItemStateByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<ItemStateFormState>(() =>
    buildInitialForm(
      payload,
      existing?.name,
      existing?.color ?? null,
      existing?.description ?? null,
      existing?.index ?? null,
    ),
  )
  const initialFormRef = useRef<ItemStateFormState | null>(null)
  const warnings = useItemStateFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(
      payload,
      existing?.name,
      existing?.color ?? null,
      existing?.description ?? null,
      existing?.index ?? null,
    )
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing?.color, existing?.description, existing?.index, existing?.name, payload])

  const { validateForm } = useItemStateFormValidation({ formState, warnings })
  const submitters = useItemStateFormSubmit({
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

  return <ItemStateFormContextProvider value={value}>{children}</ItemStateFormContextProvider>
}
