import { useMobile } from '@/app/contexts/MobileContext'

import { LocalDeliveryStatsOverlayShell } from './LocalDeliveryStatsOverlayShell'
import { useLocalDeliveryStatsOverlayController } from './useLocalDeliveryStatsOverlayController'

export const LocalDeliveryStatsOverlay = () => {
  const { isMobile } = useMobile()
  const controller = useLocalDeliveryStatsOverlayController()

  if (isMobile || !controller.statsData) {
    return null
  }

  return (
    <div ref={controller.overlayRef} className="w-full">
      <LocalDeliveryStatsOverlayShell
        data={controller.statsData}
        hidden={controller.hidden}
        layoutMode={controller.layoutMode}
        onHide={controller.hide}
        onShow={controller.show}
      />
    </div>
  )
}
