import { ArchiveIcon, OrderIcon, PlanIcon } from '@/assets/icons'

import type { HomeMobileTabDescriptor, HomeMobileTabId } from './homeMobileShell.types'

export const HOME_MOBILE_TABS: readonly HomeMobileTabDescriptor[] = [
  { id: 'plans', label: 'Plans', icon: PlanIcon },
  { id: 'orders', label: 'Orders', icon: OrderIcon },
  { id: 'cases', label: 'Cases', icon: ArchiveIcon },
]

export const HOME_MOBILE_TAB_LABELS: Record<HomeMobileTabId, string> = {
  plans: 'Plans',
  orders: 'Orders',
  cases: 'Cases',
}
