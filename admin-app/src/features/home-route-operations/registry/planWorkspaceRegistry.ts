import type { ComponentType } from 'react'

import { InternationalShippingOrdersPage } from '@/features/international-shipping-orders'
import { RouteGroupsPage } from '@/features/plan/routeGroup/pages/RouteGroups.page'
import { StorePickupOrdersPage } from '@/features/store-pickup-orders'
import type { RoutePlanObjective } from '@/features/plan/types/plan'

/**
 * The panel payload with `planId` narrowed to a real number — every workspace
 * page bails on a missing id, so the shell normalizes `null` away before it
 * reaches them.
 */
export type PlanWorkspacePayload = {
  planId?: number
  freshAfter?: string | null
}

export type PlanWorkspaceProps = {
  payload: PlanWorkspacePayload
  onRequestClose?: () => void
}

/**
 * Which page fills the workspace panel for a given plan type. All three take the
 * same `{ planId, freshAfter }` payload, so the shell picks a component and
 * passes the payload through untouched.
 */
export const planWorkspaceRegistry: Record<
  RoutePlanObjective,
  ComponentType<PlanWorkspaceProps>
> = {
  local_delivery: RouteGroupsPage,
  international_shipping: InternationalShippingOrdersPage,
  store_pickup: StorePickupOrdersPage,
}
