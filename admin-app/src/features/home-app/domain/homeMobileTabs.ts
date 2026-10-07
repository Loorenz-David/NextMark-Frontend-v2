import { BellIcon, OrderIcon, PlanIcon, SettingIcon } from '@/assets/icons'

import type { HomeMobileTabDescriptor, HomeMobileTabId } from './homeMobileShell.types'

export const HOME_MOBILE_TABS: readonly HomeMobileTabDescriptor[] = [
  { id: 'plans', label: 'Plans', icon: PlanIcon },
  { id: 'orders', label: 'Orders', icon: OrderIcon },
  { id: 'alerts', label: 'Alerts', icon: BellIcon },
  { id: 'settings', label: 'Settings', icon: SettingIcon },
]

export const HOME_MOBILE_TAB_LABELS: Record<HomeMobileTabId, string> = {
  plans: 'Plans',
  orders: 'Orders',
  alerts: 'Alerts',
  settings: 'Settings',
}
