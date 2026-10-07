import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { PageBackButton } from '@/shared/buttons/PageBackButton'
import { useBackLayerRegistration } from '@/shared/overlays/bottomSheet'

type PushedPageProps = {
  open: boolean
  onBack: () => void
  /** Header title. Without one no header is rendered and the content brings its own. */
  title?: string
  backAriaLabel?: string
  headerAction?: ReactNode
  children: ReactNode
}

/**
 * A full-screen page pushed on top of a phone popup (an item editor inside
 * the order form, a customer form inside a picker). Slides in from the right,
 * closes with the standard back chevron, and registers as a back layer so a
 * hardware back closes it before the popup underneath.
 *
 * Renders into `document.body` above popups (z 100) and below sheets (z 140).
 */
export const PushedPage = ({
  open,
  onBack,
  title,
  backAriaLabel = 'Back',
  headerAction,
  children,
}: PushedPageProps) => {
  const prefersReducedMotion = useReducedMotion()
  useBackLayerRegistration(open, onBack)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="safe-top fixed inset-0 z-[110] flex flex-col bg-[var(--color-page)] text-[var(--color-text)]"
          initial={{ x: '100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '100%' }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {title ? (
            <header className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--surface-popup-chrome)] py-2 pl-3 pr-3">
              <PageBackButton onClick={onBack} ariaLabel={backAriaLabel} />
              <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h2>
              {headerAction ?? null}
            </header>
          ) : null}
          <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
