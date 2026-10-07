import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion'

import { CloseIcon } from '@/assets/icons'

import { bottomSheetRegistry } from './bottomSheetRegistry'
import type { BottomSheetProps } from './bottomSheet.types'

const DISMISS_OFFSET_PX = 96
const DISMISS_VELOCITY = 600

/**
 * Phone-native bottom sheet: slides up over a dimmed backdrop, dismisses by
 * dragging the grab handle down, tapping the backdrop, or the hardware back
 * button (through the registry). Content scrolls inside the sheet; the page
 * behind stays put.
 *
 * Renders into `document.body` so it sits above stacked pages and popups
 * regardless of where the trigger lives.
 */
export const BottomSheet = ({
  open,
  onClose,
  title,
  showHeader = title != null,
  children,
  maxHeight = '85dvh',
  bodyClassName,
  trackForBack = true,
}: BottomSheetProps) => {
  const sheetId = useId()
  const titleId = `${sheetId}-title`
  const prefersReducedMotion = useReducedMotion()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open || !trackForBack) return
    bottomSheetRegistry.register(sheetId, () => onCloseRef.current())
    return () => {
      bottomSheetRegistry.unregister(sheetId)
    }
  }, [open, sheetId, trackForBack])

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.y > DISMISS_OFFSET_PX || info.velocity.y > DISMISS_VELOCITY) {
      onClose()
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[140] flex flex-col justify-end">
          <motion.div
            className="absolute inset-0 popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title != null ? titleId : undefined}
            className="admin-glass-panel-strong safe-bottom relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl border-t border-[var(--color-border)] text-[var(--color-text)] shadow-[var(--shadow-panel-floating)]"
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 380, damping: 36 }
            }
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-2.5">
              <span className="h-1.5 w-10 rounded-full bg-[var(--color-muted)]/40" aria-hidden="true" />
            </div>

            {showHeader ? (
              <div className="admin-glass-divider flex shrink-0 items-center justify-between gap-3 border-b px-4 pb-3 pt-1">
                <h2 id={titleId} className="min-w-0 truncate text-base font-semibold">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted)] active:bg-surface-hover"
                >
                  <CloseIcon className="h-4 w-4 app-icon" />
                </button>
              </div>
            ) : null}

            <div
              className={`scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName ?? 'px-3 pb-3 pt-2'}`}
            >
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
