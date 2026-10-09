import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useClientFormRedirectByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormRedirect } from '../../types/clientFormRedirect'
import { ClientFormRedirectFormContextProvider } from './ClientFormRedirectForm.context'
import type {
  ClientFormRedirectFormPayload,
  ClientFormRedirectFormState,
} from './ClientFormRedirectForm.types'
import { useClientFormRedirectFormValidation } from './ClientFormRedirectForm.validation'
import { useClientFormRedirectFormWarnings } from './ClientFormRedirectForm.warnings'
import { useClientFormRedirectFormSubmit } from './useClientFormRedirectFormSubmit'

const buildInitialForm = (redirect?: ClientFormRedirect | null): ClientFormRedirectFormState => ({
  label: redirect?.label ?? '',
  url: redirect?.url ?? 'https://',
})

export const ClientFormRedirectFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ClientFormRedirectFormPayload
}) => {
  const existing = useClientFormRedirectByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<ClientFormRedirectFormState>(() =>
    buildInitialForm(existing),
  )
  const initialFormRef = useRef<ClientFormRedirectFormState | null>(null)
  const warnings = useClientFormRedirectFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(existing)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing])

  const { validateForm } = useClientFormRedirectFormValidation({ formState, warnings })
  const submitters = useClientFormRedirectFormSubmit({
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

  return (
    <ClientFormRedirectFormContextProvider value={value}>
      {children}
    </ClientFormRedirectFormContextProvider>
  )
}
