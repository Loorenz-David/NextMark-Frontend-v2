import { useSyncExternalStore, type ComponentType, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  getAdminNotificationSnapshot,
  subscribeAdminNotifications,
} from '@/realtime/notifications/notification.store'
import { SectionPanel } from '@/shared/section-panel/SectionPanel'

import { isHomeMobileShellTab, isHomeMobileTabRootActive } from '../../domain/homeMobileShell.domain'
import type { HomeMobileShellTabId } from '../../domain/homeMobileShell.types'
import { useHomeMobileBackFlow } from '../../flows/homeMobileBack.flow'
import { useHomeMobileLayersFlow } from '../../flows/homeMobileLayers.flow'
import { useHomeMobileCloseLayerFlow } from '../../flows/useHomeMobileCloseLayer.flow'
import { useHomeMobileShellStore } from '../../stores/homeMobileShell.store'
import { HomeMobileAlertsPage } from './HomeMobileAlertsPage'
import { HomeMobileSettingsPage } from './HomeMobileSettingsPage'
import { HomeMobileTabBar } from './HomeMobileTabBar'

const shellTabRoots: Record<HomeMobileShellTabId, ComponentType> = {
  alerts: HomeMobileAlertsPage,
  settings: HomeMobileSettingsPage,
}

type HomeMobileShellProps = {
  /** The active workspace's mobile view: it fills the plans and orders tabs. */
  children: ReactNode
}

/**
 * Phone chrome around the active workspace: a tab bar plus the back-button
 * integration. Plans and Orders come from the workspace; Alerts and
 * Settings belong to the shell so they stay reachable in every workspace.
 * Pushed pages and popups render above all of it.
 */
export const HomeMobileShell = ({ children }: HomeMobileShellProps) => {
  const layers = useHomeMobileLayersFlow()
  const closeLayer = useHomeMobileCloseLayerFlow()
  useHomeMobileBackFlow({ enabled: true, layers, closeLayer })
  const isRootActive = isHomeMobileTabRootActive(layers)
  const { activeTab, mountedTabs } = useHomeMobileShellStore(
    useShallow((state) => ({ activeTab: state.activeTab, mountedTabs: state.mountedTabs })),
  )
  const { unreadCount } = useSyncExternalStore(
    subscribeAdminNotifications,
    getAdminNotificationSnapshot,
    getAdminNotificationSnapshot,
  )

  const isWorkspaceTabActive = !isHomeMobileShellTab(activeTab)
  const mountedShellTabs = mountedTabs.filter(isHomeMobileShellTab)

  return (
    <div className="admin-mobile-shell relative flex h-dvh w-full flex-col overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
      <div className="safe-top relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          inert={!isWorkspaceTabActive || !isRootActive}
          aria-hidden={!isWorkspaceTabActive}
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            isWorkspaceTabActive ? '' : 'invisible pointer-events-none'
          }`}
        >
          {children}
        </div>

        {mountedShellTabs.map((tab) => {
          const TabRoot = shellTabRoots[tab]
          const isActive = tab === activeTab
          return (
            <div
              key={tab}
              role="tabpanel"
              aria-hidden={!isActive}
              inert={!isActive || !isRootActive}
              className={`absolute inset-0 flex min-h-0 flex-col overflow-hidden ${
                isActive ? '' : 'invisible pointer-events-none'
              }`}
            >
              <SectionPanel>
                <TabRoot />
              </SectionPanel>
            </div>
          )
        })}
      </div>

      <HomeMobileTabBar inert={!isRootActive} badges={{ alerts: unreadCount }} />
    </div>
  )
}
