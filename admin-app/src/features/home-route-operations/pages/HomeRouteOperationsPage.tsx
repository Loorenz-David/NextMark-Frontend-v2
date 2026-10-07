import { useMobile } from '@/app/viewport'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { AdminNotificationWorkspaceBridge } from '@/realtime/notifications'

import { HomeDesktopView } from '../views/HomeDesktopView'
import { HomeMobileView } from '../views/HomeMobileView'
import type { PayloadBase } from '../types/types'
import { HomeRouteOperationsManagersProvider } from '../providers/HomeRouteOperationsManagersProvider'

export const HomeRouteOperationsPage = () => {
  return (
    <HomeRouteOperationsManagersProvider>
      <AdminNotificationWorkspaceBridge />
      <HomeRouteOperationsContent />
    </HomeRouteOperationsManagersProvider>
  )
}

const HomeRouteOperationsContent = () => {
  const { isMobile } = useMobile()
  const baseControlls = useBaseControlls<PayloadBase>()
  const disableAuroraBackground =
    baseControlls.isBaseOpen && typeof baseControlls.payload?.planId === 'number'

  return (
    <div className="admin-app-shell h-full overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
      <div
        className="admin-shell-aurora admin-shell-aurora--one transition-opacity duration-200"
        style={{ opacity: disableAuroraBackground ? 0 : 1 }}
      />
      <div
        className="admin-shell-aurora admin-shell-aurora--two transition-opacity duration-200"
        style={{ opacity: disableAuroraBackground ? 0 : 1 }}
      />
      <div
        className="admin-shell-aurora admin-shell-aurora--three transition-opacity duration-200"
        style={{ opacity: disableAuroraBackground ? 0 : 1 }}
      />
      <div
        className={`relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden ${
          isMobile ? "" : "admin-home-desktop-workspace"
        }`}
      >
        {isMobile ? <HomeMobileView /> : <HomeDesktopView />}
      </div>
    </div>
  )
}
