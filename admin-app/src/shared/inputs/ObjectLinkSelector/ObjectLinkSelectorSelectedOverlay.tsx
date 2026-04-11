import { CloseIcon } from '@/assets/icons'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

import { ObjectLinkSelectorOptionCard } from './ObjectLinkSelectorOptionCard'
import type { ObjectLinkSelectorSelectedOverlayProps } from './ObjectLinkSelector.types'

export const ObjectLinkSelectorSelectedOverlay = ({
  open,
  title,
  items,
  emptyMessage,
  onClose,
  onRemoveItem,
}: ObjectLinkSelectorSelectedOverlayProps) => {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[170] flex items-center justify-center">
          <motion.button
            type="button"
            className="absolute inset-0 popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative z-10 flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[var(--color-page)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/70 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
                <p className="text-xs text-[var(--color-muted)]">Selected values linked to this field.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                aria-label="Close selected values overlay"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-4 scroll-thin">
              {items.length ? (
                items.map((item) => (
                  <ObjectLinkSelectorOptionCard
                    key={item.id}
                    item={item}
                    onRemove={onRemoveItem}
                  />
                ))
              ) : (
                <p className="text-sm text-[var(--color-muted)]">{emptyMessage}</p>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
