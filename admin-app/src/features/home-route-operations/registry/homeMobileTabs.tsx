import type { ComponentType } from 'react'

import type { HomeMobileWorkspaceTabId } from '@/features/home-app'
import { OrderMainPage } from '@/features/order/pages/orderMain.page'
import { RoutePlanPage } from '@/features/plan/pages/Plan.page'

/**
 * What each workspace-owned phone tab shows for route operations. Tab roots
 * are long-lived: they mount on first visit and stay mounted so lists keep
 * their scroll position and filters across tab switches.
 */
export const homeMobileTabRegistry: Record<HomeMobileWorkspaceTabId, ComponentType> = {
  plans: () => <RoutePlanPage showCloseButton={false} />,
  orders: OrderMainPage,
}
