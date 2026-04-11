import type { OrderDeleteResponse } from '@/features/order/types/order'
import { applyOrderRouteArtifacts } from '@/features/plan/bridges/orderRouteArtifacts.bridge'

type OrderDeleteBundle = OrderDeleteResponse['updated'][number]

export const handlePlanOrderDelete = (bundle: OrderDeleteBundle): void => {
  applyOrderRouteArtifacts(bundle)
}
