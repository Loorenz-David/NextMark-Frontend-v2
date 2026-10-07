import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
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
  // This counter tablet only ever serves Swedish customers, so the phone
  // field opens on +46 rather than the previous customer's remembered prefix,
  // and the delivery address field is restricted to Sweden.
  defaultPhonePrefix: '+46',
  addressCountryRestriction: 'se',
}

type Screen = 'idle' | 'preparing' | 'collecting' | 'submitted' | 'unavailable'

/**
 * The safe-area padding is for the installed iPad app, which draws edge to edge:
 * without it the form's own margins are all that keep it off the rounded corners
 * and the home indicator, and in landscape that is not enough. The insets are
 * zero in a browser tab, so this is the same layout it has always been there.
 */
const PageLayout = ({ children }: { children: ReactNode }) => (
  <div
    className="client-form-theme relative min-h-dvh overflow-hidden bg-[var(--paper)]"
    style={{
      paddingTop: 'env(safe-area-inset-top)',
      paddingRight: 'env(safe-area-inset-right)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
    }}
  >
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
        {/* The form stays mounted through 'submitted': the kit's submission
            screen turns its spinner into the confirmation over it. */}
        {screen === 'collecting' || screen === 'submitted' ? (
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
                {/* On a phone the masthead is only the delivery date. A gap
                    rather than space-y, so the hidden lines leave no margin. */}
                <header className="flex flex-col gap-3 pb-2 text-center">
                  <p className="hidden text-[length:var(--cf-eyebrow)] font-semibold uppercase tracking-[0.34em] text-[var(--ink-faint)] sm:block">
                    Leveransuppgifter
                  </p>
                  <h1 className="hidden text-[length:var(--cf-title)] font-normal leading-tight tracking-[0.01em] text-[var(--ink)] sm:block">
                    Bekräfta dina leveransuppgifter
                  </h1>
                  <div aria-hidden="true" className="mx-auto hidden w-24 space-y-[3px] pt-1 sm:block">
                    <div className="h-px bg-[var(--rule-strong)]" />
                    <div className="h-px bg-[var(--rule)]" />
                  </div>
                  <ClientFormScheduledDate meta={meta} />
                  <p className="hidden text-[length:var(--cf-body)] italic leading-relaxed text-[var(--ink-soft)] sm:block">
                    Fyll i de tre stegen för att skicka dina uppgifter.
                  </p>
                </header>

                <ClientFormSteps />
              </div>
            </ClientFormProvider>
          </motion.div>
        ) : screen === 'preparing' ? (
          <Notice motionKey="external-form-preparing">
            <p className="py-10 text-[length:var(--cf-body)] italic text-[var(--ink-soft)]">
              Förbereder formuläret…
            </p>
          </Notice>
        ) : screen === 'unavailable' ? (
          <Notice motionKey="external-form-unavailable">
            <p className="py-10 text-[length:var(--cf-body)] text-[var(--danger)]">
              Formuläret kunde inte laddas. Be personalen att skicka det igen.
            </p>
          </Notice>
        ) : (
          <Notice motionKey="external-form-idle">
            <p className="py-10 text-[length:var(--cf-body)] italic text-[var(--ink-soft)]">
              Väntar på nästa formulär…
            </p>
          </Notice>
        )}
        </AnimatePresence>
      </ClientFormFrame>
    </PageLayout>
  )
}
