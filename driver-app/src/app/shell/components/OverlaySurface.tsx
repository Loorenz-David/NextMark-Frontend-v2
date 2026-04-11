import { useMemo, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { OrderCaseMainPage } from '@/features/order-case/pages/OrderCaseMainPage'
import { RouteDateAdjustWarningOverlayPage } from '@/features/route-execution/pages/RouteDateAdjustWarningOverlayPage'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectOverlayState } from '../stores/shell.selectors'
import { ShellOverlayPlaceholderPage } from './ShellOverlayPlaceholderPage'

export function OverlaySurface() {
  const { store, closeOverlay, popOverlay } = useDriverAppShell()
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const overlayState = useMemo(() => selectOverlayState(shellState), [shellState])
  const dismissOverlay = overlayState.canPop ? popOverlay : closeOverlay
  const currentPage = overlayState.currentPage

  const currentOverlayPage = currentPage?.page === 'shell-overlay-placeholder'
    ? (
        <ShellOverlayPlaceholderPage
          message={currentPage.params.message}
          onClose={closeOverlay}
          title={currentPage.params.title}
        />
      )
      : currentPage?.page === 'order-case-main'
        ? (
          <OrderCaseMainPage
            onClose={closeOverlay}
            freshAfter={currentPage.params.freshAfter}
            initialOrderCaseClientId={currentPage.params.orderCaseClientId}
            initialOrderCaseId={currentPage.params.orderCaseId}
            orderClientId={currentPage.params.orderClientId}
            orderId={currentPage.params.orderId}
            stopClientId={currentPage.params.stopClientId}
          />
        )
      : currentPage?.page === 'route-date-adjust-warning'
        ? (
            <RouteDateAdjustWarningOverlayPage
              confirmLabel={currentPage.params.confirmLabel}
              message={currentPage.params.message}
              onClose={dismissOverlay}
              onConfirm={currentPage.params.onConfirm}
              title={currentPage.params.title}
            />
          )
      : null

  return (
    <section className={`driver-overlay-surface${overlayState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close overlay"
        className="driver-overlay-surface__backdrop"
        onClick={dismissOverlay}
        type="button"
      />

      {currentOverlayPage ? (
        <motion.div
          className="driver-overlay-surface__panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 0.8, 0.2, 1] }}
        >
          {currentOverlayPage}
        </motion.div>
      ) : null}
    </section>
  )
}
