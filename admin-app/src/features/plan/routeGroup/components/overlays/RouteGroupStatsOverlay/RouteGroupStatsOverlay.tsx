import { useMobile } from '@/app/contexts/MobileContext'

import { RouteGroupStatsOverlayShell } from './RouteGroupStatsOverlayShell'
import { useRouteGroupStatsOverlayController } from './useRouteGroupStatsOverlayController'

export const RouteGroupStatsOverlay = () => {
  const { isMobile } = useMobile()
  const controller = useRouteGroupStatsOverlayController()

  if (isMobile || !controller.statsData) {
    return null
  }

  return (
    <div ref={controller.overlayRef} className="w-full">
      <RouteGroupStatsOverlayShell
        data={controller.statsData}
        hidden={controller.hidden}
        layoutMode={controller.layoutMode}
        onHide={controller.hide}
        onShow={controller.show}
      />
    </div>
  )
}
