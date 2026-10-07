import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClientFormProvider,
  EMPTY_CLIENT_FORM_CONFIG,
  EMPTY_CLIENT_FORM_META,
  type ClientFormConfig,
  type ClientFormMeta,
  type ClientFormOptions,
} from '@client-form-kit'
import { ClientFormContent } from './ClientFormContent'
import { fetchClientForm } from '../../../api/clientForm.api'
import { isClientFormRequestError } from '../domain/clientFormError'
import {
  statusFromClientFormErrorCode,
  type ClientFormStatus,
} from '../domain/clientFormStatus'
import { createTokenClientFormPorts } from '../ports/tokenClientForm.ports'
import {
  CLIENT_FORM_SAVED_LOCATIONS_INTENT_KEY,
  CLIENT_FORM_STORAGE_NAMESPACE,
} from '../constants/storage'
import { CheckMarkIcon } from '../../../assets/icons/CheckMarkIcon'
import { PublicCenteredState } from '../../../app/layout/PublicCenteredState'

/**
 * The public link is opened on the customer's own device, so remembering their
 * address between orders is a convenience rather than a leak, and the full
 * consent block applies.
 */
const OPTIONS: ClientFormOptions = {
  storageNamespace: CLIENT_FORM_STORAGE_NAMESPACE,
  savedLocationsIntentKey: CLIENT_FORM_SAVED_LOCATIONS_INTENT_KEY,
  enableSavedLocations: true,
  collectOrderNotes: true,
  collectMarketingConsent: true,
}

interface Props {
  token: string
}

export const ClientFormPage = ({ token }: Props) => {
  const [status, setStatus] = useState<ClientFormStatus>({ state: 'loading' })
  const [meta, setMeta] = useState<ClientFormMeta>(EMPTY_CLIENT_FORM_META)
  const [config, setConfig] = useState<ClientFormConfig>(EMPTY_CLIENT_FORM_CONFIG)

  useEffect(() => {
    fetchClientForm(token)
      .then((bootstrap) => {
        setMeta(bootstrap.meta)
        setConfig(bootstrap.config)
        setStatus({ state: 'ready' })
      })
      .catch((err: unknown) => {
        setStatus(
          isClientFormRequestError(err)
            ? statusFromClientFormErrorCode(err.code)
            : { state: 'invalid' },
        )
      })
  }, [token])

  const handleSubmitted = useCallback(() => setStatus({ state: 'submitted' }), [])

  const ports = useMemo(
    () =>
      createTokenClientFormPorts({
        token,
        onTerminated: setStatus,
      }),
    [token],
  )

  if (status.state === 'loading') {
    return (
      <PublicCenteredState>
        <p className="text-sm text-[var(--ink-soft)]">Laddar…</p>
      </PublicCenteredState>
    )
  }

  if (status.state === 'expired') {
    return (
      <PublicCenteredState
        title="Länken har gått ut"
        description="Länken till formuläret har gått ut. Kontakta avsändaren för att få en ny."
      />
    )
  }

  if (status.state === 'already_submitted') {
    return (
      <PublicCenteredState
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 shadow-none">
            <CheckMarkIcon className="h-7 w-7 text-[var(--accent)]" />
          </div>
        }
        title="Redan skickat"
        description="Vi har redan tagit emot dina uppgifter. Tack!"
      />
    )
  }

  if (status.state === 'invalid') {
    return <PublicCenteredState description="Länken är inte giltig." />
  }

  // 'submitted' renders the form too: the kit's submission screen is already
  // showing the confirmation over it, and unmounting would cut that short.

  return (
    <ClientFormProvider
      meta={meta}
      config={config}
      ports={ports}
      options={OPTIONS}
      onSubmitted={handleSubmitted}
    >
      <ClientFormContent />
    </ClientFormProvider>
  )
}
