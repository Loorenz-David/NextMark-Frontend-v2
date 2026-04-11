import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useItemPositionByClientId } from '../../hooks/useItemSelectors'

import { ItemPositionFormContextProvider } from './ItemPositionForm.context'
import type { ItemPositionFormPayload, ItemPositionFormState } from './ItemPositionForm.types'
import { useItemPositionFormWarnings } from './ItemPositionForm.warnings'
import { useItemPositionFormValidation } from './ItemPositionForm.validation'
import { useItemPositionFormSubmit } from './useItemPositionFormSubmit'

const buildInitialForm = (
  payload: ItemPositionFormPayload,
  name?: string,
  description?: string | null,
  defaultValue?: boolean,
  isSystem?: boolean,
) => ({
  name: name ?? '',
  description: description ?? '',
  default: defaultValue ?? false,
  is_system: isSystem ?? false,
})

export const ItemPositionFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ItemPositionFormPayload
}) => {
  const existing = useItemPositionByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<ItemPositionFormState>(() =>
    buildInitialForm(payload, existing?.name, existing?.description, existing?.default, existing?.is_system),
  )
  const initialFormRef = useRef<ItemPositionFormState | null>(null)
  const warnings = useItemPositionFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(payload, existing?.name, existing?.description, existing?.default, existing?.is_system)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing?.default, existing?.description, existing?.is_system, existing?.name, payload])

  const { validateForm } = useItemPositionFormValidation({ formState, warnings })
  const submitters = useItemPositionFormSubmit({
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

  return <ItemPositionFormContextProvider value={value}>{children}</ItemPositionFormContextProvider>
}
