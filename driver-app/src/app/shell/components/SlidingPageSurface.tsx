import { useMemo, useSyncExternalStore } from 'react'
import { CloseIcon } from '@/assets/icons'
import { DriverNotificationsPage } from '@/app/notifications'
import {
  MapAppChooserPage,
  PhoneCallChooserPage,
  RouteThreeDotMenuPage,
  StopCustomerPage,
  StopFailureFormPage,
  StopOrderItemsPage,
  StopOrderNotesPage,
} from '@/features/route-execution'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectSlidingPageState } from '../stores/shell.selectors'

function TestSlidingPage({
  onClose,
  title,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div className="driver-sliding-page-surface__panel-content">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        </div>

        <button
          aria-label="Close sliding page"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1" />
    </div>
  )
}

export function SlidingPageSurface() {
  const { store, closeSlidingPage } = useDriverAppShell()
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const slidingPageState = useMemo(() => selectSlidingPageState(shellState), [shellState])

  return (
    <section className={`driver-sliding-page-surface${slidingPageState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close sliding page"
        className="driver-sliding-page-surface__backdrop"
        onClick={closeSlidingPage}
        type="button"
      />

      <div className="driver-sliding-page-surface__panel">
        {slidingPageState.currentPage?.page === 'test-sliding-page' ? (
          <TestSlidingPage
            onClose={closeSlidingPage}
            title={slidingPageState.currentPage.params.title}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'notifications' ? (
          <DriverNotificationsPage />
        ) : null}
        {slidingPageState.currentPage?.page === 'route-stop-failure-form' ? (
          <StopFailureFormPage
            onClose={closeSlidingPage}
            orderId={slidingPageState.currentPage.params.orderId}
            stopClientId={slidingPageState.currentPage.params.stopClientId}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'route-stop-order-items' ? (
          <StopOrderItemsPage
            onClose={closeSlidingPage}
            stopClientId={slidingPageState.currentPage.params.stopClientId}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'route-stop-customer' ? (
          <StopCustomerPage
            onClose={closeSlidingPage}
            stopClientId={slidingPageState.currentPage.params.stopClientId}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'map-app-chooser' ? (
          <MapAppChooserPage
            destination={slidingPageState.currentPage.params.destination}
            onClose={closeSlidingPage}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'phone-call-chooser' ? (
          <PhoneCallChooserPage
            onClose={closeSlidingPage}
            options={slidingPageState.currentPage.params.options}
          />
        ) : null}
        {slidingPageState.currentPage?.page === 'route-three-dot-menu' ? (
          <RouteThreeDotMenuPage onClose={closeSlidingPage} />
        ) : null}
        {slidingPageState.currentPage?.page === 'route-stop-order-notes' ? (
          <StopOrderNotesPage
            notes={slidingPageState.currentPage.params.notes}
            onClose={closeSlidingPage}
          />
        ) : null}
      </div>
    </section>
  )
}
