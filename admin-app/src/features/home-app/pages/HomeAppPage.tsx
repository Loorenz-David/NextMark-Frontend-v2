import { lazy, Suspense } from 'react'

import { useMobile } from '@/app/contexts/MobileContext'
import { HomeRouteOperationsPage } from '@/features/home-route-operations'
import { WorkspaceSkeleton } from '../components/WorkspaceSkeleton'
import { HomeAppProvider, useHomeApp } from '../providers/HomeAppProvider'
import { HomeAppManagersProvider } from '../providers/HomeAppManagersProvider'
import { HomeDesktopHeader } from '../components/HomeDesktopHeader'
import { HomeOverlays } from '@/features/home-route-operations/components/HomeOverlays'
import { OrderLinkedDeviceLiveWidget } from '@/features/order/components/linkedDeviceLive/OrderLinkedDeviceLiveWidget'

const HomeStorePickupPage = lazy(() =>
  import('@/features/home-store-pickup/pages/HomeStorePickupPage').then((module) => ({
    default: module.HomeStorePickupPage,
  })),
)
const HomeInternationalShippingPage = lazy(() =>
  import('@/features/home-international-shipping/pages/HomeInternationalShippingPage').then(
    (module) => ({
      default: module.HomeInternationalShippingPage,
    }),
  ),
)

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
    return (
      <>
        <ActiveWorkspaceView workspace={activeWorkspace} />
        <HomeOverlays />
        <OrderLinkedDeviceLiveWidget />
      </>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <HomeDesktopHeader />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <ActiveWorkspaceView workspace={activeWorkspace} />
      </div>
      {/* Global popup render host — available across all home workspaces so the
          account switcher (and every home popup) renders regardless of the
          active workspace. */}
      <HomeOverlays />
      <OrderLinkedDeviceLiveWidget />
    </div>
  )
}

function ActiveWorkspaceView({ workspace }: { workspace: ReturnType<typeof useHomeApp>['activeWorkspace'] }) {
  if (workspace === 'route-operations') {
    return <HomeRouteOperationsPage />
  }

  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      {workspace === 'store-pickup' ? <HomeStorePickupPage /> : <HomeInternationalShippingPage />}
    </Suspense>
  )
}
