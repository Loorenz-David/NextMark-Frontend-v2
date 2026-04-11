import { useMobile } from '@/app/contexts/MobileContext'
import { HomeRouteOperationsPage } from '@/features/home-route-operations'
import { HomeStorePickupPage } from '@/features/home-store-pickup/pages/HomeStorePickupPage'
import { HomeInternationalShippingPage } from '@/features/home-international-shipping/pages/HomeInternationalShippingPage'
import { HomeAppProvider, useHomeApp } from '../providers/HomeAppProvider'
import { HomeAppManagersProvider } from '../providers/HomeAppManagersProvider'
import { HomeDesktopHeader } from '../components/HomeDesktopHeader'

export function Home() {
  return (
    <HomeAppProvider>
      <HomeAppManagersProvider>
        <HomeAppShell />
      </HomeAppManagersProvider>
    </HomeAppProvider>
  )
}

function HomeAppShell() {
  const { isMobile } = useMobile()
  const { activeWorkspace } = useHomeApp()

  if (isMobile) {
    return <ActiveWorkspaceView workspace={activeWorkspace} />
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <HomeDesktopHeader />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <ActiveWorkspaceView workspace={activeWorkspace} />
      </div>
    </div>
  )
}

function ActiveWorkspaceView({ workspace }: { workspace: ReturnType<typeof useHomeApp>['activeWorkspace'] }) {
  switch (workspace) {
    case 'route-operations':
      return <HomeRouteOperationsPage />
    case 'store-pickup':
      return <HomeStorePickupPage />
    case 'international-shipping':
      return <HomeInternationalShippingPage />
  }
}
