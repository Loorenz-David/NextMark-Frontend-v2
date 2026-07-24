import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
        <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
      </PublicCenteredState>
    )
  }

  if (status.state === 'expired') {
    return (
      <PublicCenteredState
        title="Link expired"
        description="This form link has expired. Please contact the sender to request a new one."
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
        title="Already submitted"
        description="Your information has already been received. Thank you!"
      />
    )
  }

  if (status.state === 'submitted') {
    return (
      <PublicCenteredState>
        <AnimatePresence>
          <motion.div initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex max-w-sm flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 shadow-none"
            >
              <CheckMarkIcon className="h-8 w-8 text-[var(--accent)]" />
            </motion.div>
            <p className="text-xl font-semibold text-[var(--ink)]">Form submitted</p>
            <p className="text-sm text-[var(--ink-soft)]">Your information has been received. Thank you!</p>
          </motion.div>
        </AnimatePresence>
      </PublicCenteredState>
    )
  }

  if (status.state === 'invalid') {
    return <PublicCenteredState description="This link is not valid." />
  }

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
