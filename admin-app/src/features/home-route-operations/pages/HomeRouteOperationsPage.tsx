import { useEffect } from 'react'
import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { ArchiveIcon } from '@/assets/icons'
import { useOrderCaseActions } from '@/features/orderCase/actions/orderCase.actions'
import { useHomeApp } from '@/features/home-app/providers/HomeAppProvider'
import { AdminNotificationWorkspaceBridge } from '@/realtime/notifications'

import { HomeOverlays } from '../components/HomeOverlays'
import { HomeDesktopView } from '../views/HomeDesktopView'
import { HomeMobileView } from '../views/HomeMobileView'
import type { PayloadBase } from '../types/types'
import { HomeRouteOperationsManagersProvider } from '../providers/HomeRouteOperationsManagersProvider'

export const HomeRouteOperationsPage = () => {
  return (
    <HomeRouteOperationsManagersProvider>
      <AdminNotificationWorkspaceBridge />
      <RouteOperationsHeaderActionsRegistrar />
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
      <HomeOverlays />
      <div className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden">
        {isMobile ? <HomeMobileView /> : <HomeDesktopView />}
      </div>
    </div>
  )
}

const RouteOperationsHeaderActionsRegistrar = () => {
  const { openCaseMain } = useOrderCaseActions()
  const { setHeaderActions } = useHomeApp()

  useEffect(() => {
    setHeaderActions(
      <BasicButton
        params={{
          variant: 'toolbarSecondary',
          ariaLabel: 'Cases',
          className: 'border-[var(--color-muted)]/24 px-4 py-[5px]',
          onClick: openCaseMain,
        }}
      >
        <ArchiveIcon className="mr-2 h-4 w-4" />
        Cases
      </BasicButton>,
    )

    return () => {
      setHeaderActions(null)
    }
  }, [openCaseMain, setHeaderActions])

  return null
}
