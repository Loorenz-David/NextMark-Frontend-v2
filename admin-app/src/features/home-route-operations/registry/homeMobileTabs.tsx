import type { ComponentType } from 'react'

import type { HomeMobileTabId } from '@/features/home-app'
import { OrderMainPage } from '@/features/order/pages/orderMain.page'
import { CaseMainPage } from '@/features/orderCase/pages/main/CaseMainPage'
import { RoutePlanPage } from '@/features/plan/pages/Plan.page'

/**
 * What each phone tab shows for the route-operations workspace. Tab roots
 * are long-lived: they mount on first visit and stay mounted so lists keep
 * their scroll position and filters across tab switches.
 */
export const homeMobileTabRegistry: Record<HomeMobileTabId, ComponentType> = {
  plans: () => <RoutePlanPage showCloseButton={false} />,
  orders: OrderMainPage,
  cases: () => <CaseMainPage />,
}
