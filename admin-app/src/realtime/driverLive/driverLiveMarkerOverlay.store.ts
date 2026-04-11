import { create } from 'zustand'
import type { DriverLocationUpdatedPayload } from '@shared-realtime'

export type DriverLiveMarkerOverlayState = {
  markerId: string | null
  markerAnchorEl: HTMLElement | null
  position: DriverLocationUpdatedPayload | null
}

type DriverLiveMarkerOverlayStore = {
  overlay: DriverLiveMarkerOverlayState
  openOverlay: (params: {
    markerId: string
    markerAnchorEl: HTMLElement
    position: DriverLocationUpdatedPayload
  }) => void
  closeOverlay: () => void
}

const EMPTY_OVERLAY: DriverLiveMarkerOverlayState = {
  markerId: null,
  markerAnchorEl: null,
  position: null,
}

export const useDriverLiveMarkerOverlayStore = create<DriverLiveMarkerOverlayStore>((set) => ({
  overlay: EMPTY_OVERLAY,
  openOverlay: ({ markerId, markerAnchorEl, position }) =>
    set((state) => ({
      ...state,
      overlay: {
        markerId,
        markerAnchorEl,
        position,
      },
    })),
  closeOverlay: () =>
    set((state) => {
      if (!state.overlay.markerId && !state.overlay.position) {
        return state
      }

      return {
        ...state,
        overlay: EMPTY_OVERLAY,
      }
    }),
}))
