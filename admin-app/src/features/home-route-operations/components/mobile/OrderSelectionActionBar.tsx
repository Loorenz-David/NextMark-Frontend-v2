import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { PlanPickerSheet, useAssignSelectedOrdersAction } from '@/features/plan'
import { resolveSelectionAuthorityBatchCount } from '@/features/order/domain/orderBatchTargetIds'
import { useOrderSelectionStore } from '@/features/order/store/orderSelection.store'
import {
  useOrderSelectionActions,
  useOrderSelectionMode,
} from '@/features/order/store/orderSelectionHooks.store'
import { BasicButton } from '@/shared/buttons/BasicButton'

/**
 * Sticky bar over the Orders tab while selection mode is on. On a phone the
 * plan list is never beside the order list, so "drag to plan" becomes
 * "assign to plan…" with a picker sheet.
 */
export const OrderSelectionActionBar = () => {
  const isSelectionMode = useOrderSelectionMode()
  const selectedCount = useOrderSelectionStore(resolveSelectionAuthorityBatchCount)
  const { disableSelectionMode } = useOrderSelectionActions()
  const { assignToPlan, unschedule } = useAssignSelectedOrdersAction()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const handlePick = async (planClientId: string) => {
    setIsPickerOpen(false)
    setIsBusy(true)
    try {
      await assignToPlan(planClientId)
    } finally {
      setIsBusy(false)
    }
  }

  const handleUnschedule = async () => {
    setIsBusy(true)
    try {
      await unschedule()
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isSelectionMode ? (
          <motion.div
            key="order-selection-action-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="admin-glass-panel-strong absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-[var(--color-border)] px-3 py-2.5"
          >
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-muted)]">
              {selectedCount} selected
            </span>
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: () => {
                  void handleUnschedule()
                },
                disabled: isBusy || selectedCount === 0,
                ariaLabel: 'Unschedule selected orders',
                className: 'min-h-11 px-3',
              }}
            >
              Unschedule
            </BasicButton>
            <BasicButton
              params={{
                variant: 'primary',
                onClick: () => setIsPickerOpen(true),
                disabled: isBusy || selectedCount === 0,
                ariaLabel: 'Assign selected orders to a plan',
                className: 'min-h-11 px-3',
              }}
            >
              Assign to plan…
            </BasicButton>
            <BasicButton
              params={{
                variant: 'ghost',
                onClick: disableSelectionMode,
                ariaLabel: 'Exit selection mode',
                className: 'min-h-11 px-2 text-sm text-[var(--color-muted)]',
              }}
            >
              Done
            </BasicButton>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <PlanPickerSheet
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={(planClientId) => {
          void handlePick(planClientId)
        }}
      />
    </>
  )
}
