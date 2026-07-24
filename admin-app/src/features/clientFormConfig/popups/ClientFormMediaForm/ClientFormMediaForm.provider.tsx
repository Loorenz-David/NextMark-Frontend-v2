import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { MEDIA_PLACEMENTS, type MediaPlacement } from '../../domain/mediaPlacement'
import { useClientFormMediaByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormMedia } from '../../types/clientFormMedia'
import { ClientFormMediaFormContextProvider } from './ClientFormMediaForm.context'
import type {
  ClientFormMediaFormPayload,
  ClientFormMediaFormState,
} from './ClientFormMediaForm.types'
import { useClientFormMediaFormValidation } from './ClientFormMediaForm.validation'
import { useClientFormMediaFormWarnings } from './ClientFormMediaForm.warnings'
import { useClientFormMediaFormSubmit } from './useClientFormMediaFormSubmit'

const buildInitialForm = (
  media: ClientFormMedia | null | undefined,
  fallbackPlacement: MediaPlacement,
): ClientFormMediaFormState => ({
  placement: media?.placement ?? fallbackPlacement,
  url: media?.url ?? '',
  alt_text: media?.alt_text ?? '',
  link_url: media?.link_url ?? '',
  title: media?.title ?? '',
  description: media?.description ?? '',
  enabled: media?.enabled ?? true,
})

export const ClientFormMediaFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ClientFormMediaFormPayload
}) => {
  const existing = useClientFormMediaByClientId(payload.clientId ?? null)
  const fallbackPlacement = payload.placement ?? MEDIA_PLACEMENTS[0]
  const [formState, setFormState] = useState<ClientFormMediaFormState>(() =>
    buildInitialForm(existing, fallbackPlacement),
  )
  const initialFormRef = useRef<ClientFormMediaFormState | null>(null)
  const warnings = useClientFormMediaFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(existing, fallbackPlacement)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing, fallbackPlacement])

  const { validateForm } = useClientFormMediaFormValidation({ formState, warnings })
  const submitters = useClientFormMediaFormSubmit({
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
    <ClientFormMediaFormContextProvider value={value}>
      {children}
    </ClientFormMediaFormContextProvider>
  )
}
