import type { OrderCreateBundle } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'
import { normalizeOrderResponseForStore } from '@/features/order/api/mappers/orderResponse.normalize'

export const handlePlanOrderCreation = (bundle: OrderCreateBundle): void => {
  const normalizedOrder = normalizeOrderResponseForStore(bundle?.order)
  if (!normalizedOrder?.delivery_plan_id) return

  applyOrderRouteArtifacts(bundle)
}
