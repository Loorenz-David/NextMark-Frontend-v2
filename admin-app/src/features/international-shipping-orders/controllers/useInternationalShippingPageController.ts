import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { Order } from '@/features/order'
import {
  selectOrdersByPlanId,
  useOrderStore,
} from '@/features/order/store/order.store'
import { useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { buildInternationalShippingPlanSummary } from '../domain/internationalShippingPlanSummary'
import { useInternationalShippingPageInitializationFlow } from '../flows/internationalShippingPageInitialization.flow'

export const useInternationalShippingPageController = ({
  planId,
  freshAfter,
}: {
  planId: number | null
  freshAfter?: string | null
}) => {
  const sectionManager = useSectionManager()
  const { plan } = useInternationalShippingPageInitializationFlow(
    planId,
    freshAfter,
  )
  const orders = useOrderStore(useShallow(selectOrdersByPlanId(planId)))

  const summary = useMemo(
    () =>
      buildInternationalShippingPlanSummary({
        plan,
        loadedOrderCount: orders.length,
      }),
    [orders.length, plan],
  )

  const openOrder = useCallback(
    (order: Order) => {
      if (!order.client_id && typeof order.id !== 'number') return

      sectionManager.open({
        key: 'order.details',
        payload: {
          clientId: order.client_id,
          serverId: order.id,
        },
        parentParams: {
          pageClass: 'bg-[var(--color-muted)]/10 ',
          borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
        },
      })
    },
    [sectionManager],
  )

  return {
    plan,
    orders,
    summary,
    openOrder,
    // The plan row arrives before its orders do; an empty list while the plan is
    // still unknown means "loading", not "no orders".
    isLoading: plan == null,
  }
}
