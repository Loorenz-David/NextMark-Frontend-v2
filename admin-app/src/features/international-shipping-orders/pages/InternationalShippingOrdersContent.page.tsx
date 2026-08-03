import { OrderList } from '@/features/order/components/lists/OrderList'
import { OrderLoadingList } from '@/shared/loadingCards/order'

import { InternationalShippingPlanHeader } from '../components/InternationalShippingPlanHeader'
import { useInternationalShippingOrdersContext } from '../context/useInternationalShippingOrdersContext'

type InternationalShippingOrdersPageContentProps = {
  onRequestClose?: () => void
}

export const InternationalShippingOrdersPageContent = ({
  onRequestClose,
}: InternationalShippingOrdersPageContentProps) => {
  const { plan, planId, orders, summary, openOrder, isLoading } =
    useInternationalShippingOrdersContext()

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-[var(--color-primary)]/5">
      <InternationalShippingPlanHeader
        summary={summary}
        planId={planId}
        planStateId={plan?.state_id}
        onRequestClose={onRequestClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-thin">
        {isLoading ? (
          <OrderLoadingList variant="routeGroup" />
        ) : orders.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-10">
            <div className="max-w-md rounded-xl border border-border bg-surface-raised p-6 text-center">
              <h3 className="text-lg font-semibold text-text">
                No orders on this plan yet
              </h3>
              <p className="mt-2 text-sm text-muted">
                Drag orders onto this plan from the order list to group them for
                shipment.
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4">
            <OrderList orders={orders} onOpenOrder={openOrder} />
          </div>
        )}
      </div>
    </div>
  )
}
