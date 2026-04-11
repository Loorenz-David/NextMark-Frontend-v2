import { CloseIcon } from '@/assets/icons'
import { StopOrderItemsList } from '../components/stop-order-items/StopOrderItemsList'
import { useStopOrderItemsController } from '../controllers/useStopOrderItems.controller'

type StopOrderItemsPageProps = {
  stopClientId: string
  onClose: () => void
}

export function StopOrderItemsPage({
  stopClientId,
  onClose,
}: StopOrderItemsPageProps) {
  const controller = useStopOrderItemsController(stopClientId)

  return (
    <section className="flex h-full min-h-[40vh] max-h-full flex-1 flex-col overflow-hidden bg-[rgb(var(--bg-app-color))] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">Order items</h2>
          <p className="mt-1 text-sm text-white/60">{controller.subtitle}</p>
        </div>

        <button
          aria-label="Close order items"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
      >
        <StopOrderItemsList
          items={controller.items}
          expandedItemClientId={controller.expandedItemClientId}
          onToggleItem={controller.toggleItem}
        />
      </div>
    </section>
  )
}
