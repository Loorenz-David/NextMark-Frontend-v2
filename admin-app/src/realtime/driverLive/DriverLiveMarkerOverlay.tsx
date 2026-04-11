import { DriverLocationMarkerPopover } from '@/shared/map/components/DriverLocationMarkerPopover'
import { useDriverLiveMarkerOverlayStore } from './driverLiveMarkerOverlay.store'

export const DriverLiveMarkerOverlay = () => {
  const overlay = useDriverLiveMarkerOverlayStore((state) => state.overlay)
  const closeOverlay = useDriverLiveMarkerOverlayStore((state) => state.closeOverlay)
  const isOpen = Boolean(overlay.markerId && overlay.markerAnchorEl && overlay.position)

  return (
    <DriverLocationMarkerPopover
      open={isOpen}
      anchorEl={overlay.markerAnchorEl}
      position={overlay.position}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeOverlay()
        }
      }}
    />
  )
}
