import { create } from 'zustand'
import type { DriverLocationUpdatedPayload } from '@shared-realtime'

type DriverLiveStoreState = {
  positionsByDriverId: Record<number, DriverLocationUpdatedPayload>
  setSnapshot: (positions: DriverLocationUpdatedPayload[]) => void
  upsertPosition: (position: DriverLocationUpdatedPayload) => void
  clear: () => void
}

export const useDriverLiveStore = create<DriverLiveStoreState>((set) => ({
  positionsByDriverId: {},
  setSnapshot: (positions) =>
    set({
      positionsByDriverId: Object.fromEntries(
        positions.map((position) => [position.driver_id, position]),
      ),
    }),
  upsertPosition: (position) =>
    set((state) => ({
      positionsByDriverId: {
        ...state.positionsByDriverId,
        [position.driver_id]: position,
      },
    })),
  clear: () => set({ positionsByDriverId: {} }),
}))

export const selectDriverLivePositions = (state: DriverLiveStoreState) =>
  Object.values(state.positionsByDriverId)
