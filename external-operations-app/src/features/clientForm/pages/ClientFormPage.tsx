import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ClientFormProvider } from '../context/ClientForm.provider'
import { ClientFormContent } from './ClientFormContent'
import type { ClientFormMeta, ClientFormStatus } from '../domain/clientForm.types'
import { fetchClientForm } from '../../../api/clientForm.api'
import { CheckMarkIcon } from '../../../assets/icons/CheckMarkIcon'
import { PublicCenteredState } from '../../../app/layout/PublicCenteredState'

interface Props {
  token: string
}

export const ClientFormPage = ({ token }: Props) => {
  const [status, setStatus] = useState<ClientFormStatus>({ state: 'loading' })
  const [meta, setMeta] = useState<ClientFormMeta | null>(null)

  useEffect(() => {
    fetchClientForm(token)
      .then((data) => {
        setMeta(data)
        setStatus({ state: 'ready' })
      })
      .catch((err: { status?: number }) => {
        if (err?.status === 410) setStatus({ state: 'expired' })
        else if (err?.status === 409) setStatus({ state: 'already_submitted' })
        else setStatus({ state: 'invalid' })
      })
  }, [token])

  if (status.state === 'loading') {
    return (
      <PublicCenteredState>
        <p className="text-sm text-white/46">Loading…</p>
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_24px_rgba(131,204,185,0.3)]">
            <CheckMarkIcon className="h-7 w-7 text-[#83ccb9]" />
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
              className="flex h-16 w-16 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_32px_rgba(131,204,185,0.40)]"
            >
              <CheckMarkIcon className="h-8 w-8 text-[#83ccb9]" />
            </motion.div>
            <p className="text-xl font-semibold text-white/90">Form submitted</p>
            <p className="text-sm text-white/46">Your information has been received. Thank you!</p>
          </motion.div>
        </AnimatePresence>
      </PublicCenteredState>
    )
  }

  if (status.state === 'invalid' || !meta) {
    return (
      <PublicCenteredState description="This link is not valid." />
    )
  }

  return (
    <ClientFormProvider
      token={token}
      meta={meta}
      onSubmitted={() => setStatus({ state: 'submitted' })}
    >
      <ClientFormContent />
    </ClientFormProvider>
  )
}
