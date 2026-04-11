import type { OrderUpdateResponse } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'

type OrderUpdateBundle = OrderUpdateResponse['updated'][number]

export const handlePlanOrderUpdate = (bundle: OrderUpdateBundle): void => {
  applyOrderRouteArtifacts(bundle)
}
