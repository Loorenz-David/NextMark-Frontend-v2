import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckMarkIcon,
  ClientFormFrame,
  ClientFormProvider,
  ClientFormScheduledDate,
  ClientFormSteps,
  EMPTY_CLIENT_FORM_CONFIG,
  EMPTY_CLIENT_FORM_META,
  type ClientFormConfig,
  type ClientFormMeta,
  type ClientFormOptions,
} from '@client-form-kit'

import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'
import type { ExternalFormRequestedPayload } from '@/realtime/externalForm/externalForm.realtime'

import { fetchLinkedDeviceClientFormConfig } from '../api/linkedDeviceConfig.api'
import { useExternalFormLiveProgressEmitter } from '../flows/externalFormLiveProgress.flow'
import { createLinkedDeviceClientFormPorts } from '../ports/linkedDeviceClientForm.ports'

const SUBMITTED_NOTICE_MS = 10_000

/**
 * The counter tablet is handed from one customer to the next, so it must
 * remember nothing about the last one — saved delivery addresses are read from
 * local storage and would be offered as suggestions to whoever holds it next.
 *
 * The delivery note stays off: the order draft has its own notes field, and two
 * places to write the same note is how they end up disagreeing. Terms
 * acceptance and the marketing opt-in are both the customer's own act, made on
 * this device, and both travel to the order.
 */
const OPTIONS: ClientFormOptions = {
  storageNamespace: 'beyo.admin.linked-device-form',
  savedLocationsIntentKey: 'admin-linked-device-delivery',
  enableSavedLocations: false,
  collectOrderNotes: false,
  collectMarketingConsent: true,
}

type Screen = 'idle' | 'preparing' | 'collecting' | 'submitted' | 'unavailable'

const PageLayout = ({ children }: { children: ReactNode }) => (
  <div className="client-form-theme relative min-h-dvh overflow-hidden bg-[var(--paper)]">
    <main className="relative z-10">{children}</main>
  </div>
)

const Notice = ({
  motionKey,
  children,
}: {
  motionKey: string
  children: ReactNode
}) => (
  <motion.section
    key={motionKey}
    initial={{ y: -14, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -14, opacity: 0 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className="mt-16 w-full rounded-lg border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-8 text-center"
  >
    {children}
  </motion.section>
)

export const ExternalCustomerFormPage = () => {
  const [screen, setScreen] = useState<Screen>('idle')
  const [config, setConfig] = useState<ClientFormConfig>(EMPTY_CLIENT_FORM_CONFIG)
  // The order context carried on the request — currently the route-plan
  // schedule date shown in the header. Reset per request so one customer's order
  // never leaks into the next fill.
  const [meta, setMeta] = useState<ClientFormMeta>(EMPTY_CLIENT_FORM_META)
  // Remounts the provider per request, which is how a fresh form gets blank
  // answers and a re-read of the team's terms.
  const [sessionKey, setSessionKey] = useState(0)

  const ports = useMemo(() => createLinkedDeviceClientFormPorts(), [])

  // Live preview for the till: while the customer fills the form, throttled
  // snapshots stream to the team room. Deactivating on submit stops any
  // trailing frame from arriving after the answers themselves.
  const { handleStateChange } = useExternalFormLiveProgressEmitter({
    active: screen === 'collecting',
  })

  // The media is signage: it runs while the device sits idle at the counter,
  // with no form session behind it, so the configuration is read at mount and
  // not only when a form is requested.
  useEffect(() => {
    void fetchLinkedDeviceClientFormConfig()
      .then(setConfig)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (screen !== 'submitted') return

    const timeoutId = window.setTimeout(() => setScreen('idle'), SUBMITTED_NOTICE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [screen])

  const handleRequested = useCallback((payload: ExternalFormRequestedPayload) => {
    setSessionKey((current) => current + 1)
    setMeta({
      route_plan_schedule: payload.request_data?.route_plan_schedule ?? null,
    })
    setScreen('preparing')

    // Read per request rather than once at mount: this page stays open for days
    // on a counter, and the team can publish new terms, rules or media in the
    // meantime.
    //
    // The form is not shown until this resolves. Rendering on a failed read
    // would drop the terms, the rules gate and the media without saying so —
    // and a form with no terms happily submits an order with no acceptance
    // recorded against it, which is the one failure that must not be silent.
    void fetchLinkedDeviceClientFormConfig()
      .then((loaded) => {
        setConfig(loaded)
        setScreen('collecting')
      })
      .catch(() => setScreen('unavailable'))
  }, [])

  useExternalFormRealtime({ onRequested: handleRequested })

  const handleSubmitted = useCallback(() => setScreen('submitted'), [])

  return (
    <PageLayout>
      <ClientFormFrame config={config}>
        <AnimatePresence mode="wait">
        {screen === 'collecting' ? (
          <motion.div
            key="external-form"
            initial={{ y: -26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -32, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <ClientFormProvider
              key={sessionKey}
              meta={meta}
              config={config}
              ports={ports}
              options={OPTIONS}
              onSubmitted={handleSubmitted}
              onStateChange={handleStateChange}
            >
              <div className="flex flex-col gap-6">
                <header className="space-y-3 pb-2 text-center">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[var(--ink-faint)]">
                    Delivery Details
                  </p>
                  <h1 className="text-[2rem] font-normal leading-tight tracking-[0.01em] text-[var(--ink)]">
                    Confirm delivery details
                  </h1>
                  <div aria-hidden="true" className="mx-auto w-24 space-y-[3px] pt-1">
                    <div className="h-px bg-[var(--rule-strong)]" />
                    <div className="h-px bg-[var(--rule)]" />
                  </div>
                  <ClientFormScheduledDate meta={meta} />
                  <p className="text-sm italic leading-6 text-[var(--ink-soft)]">
                    Complete all three steps to submit your details.
                  </p>
                </header>

                <ClientFormSteps />
              </div>
            </ClientFormProvider>
          </motion.div>
        ) : screen === 'preparing' ? (
          <Notice motionKey="external-form-preparing">
            <p className="py-10 text-sm italic text-[var(--ink-soft)]">
              Preparing form…
            </p>
          </Notice>
        ) : screen === 'unavailable' ? (
          <Notice motionKey="external-form-unavailable">
            <p className="py-10 text-sm text-[var(--danger)]">
              Could not load the form. Ask a member of staff to send it again.
            </p>
          </Notice>
        ) : screen === 'submitted' ? (
          <Notice motionKey="external-form-submitted">
            <div className="flex min-h-[224px] flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
                <CheckMarkIcon className="h-8 w-8" />
              </div>
              <p className="text-xl text-[var(--ink)]">Form submitted</p>
              <p className="text-sm text-[var(--ink-soft)]">
                Waiting for a new form request…
              </p>
            </div>
          </Notice>
        ) : (
          <Notice motionKey="external-form-idle">
            <p className="py-10 text-sm italic text-[var(--ink-soft)]">
              Waiting for form request…
            </p>
          </Notice>
        )}
        </AnimatePresence>
      </ClientFormFrame>
    </PageLayout>
  )
}
