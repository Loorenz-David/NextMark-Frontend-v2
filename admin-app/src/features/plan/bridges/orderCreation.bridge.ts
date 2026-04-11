import type { OrderCreateBundle } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'

export const handlePlanOrderCreation = (bundle: OrderCreateBundle): void => {
  if (!bundle?.order?.delivery_plan_id) return
  applyOrderRouteArtifacts(bundle)
}
