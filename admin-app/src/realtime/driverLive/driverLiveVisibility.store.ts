import { create } from 'zustand'

type DriverLiveVisibilityState = {
  isVisible: boolean
  setVisible: (visible: boolean) => void
  toggleVisible: () => void
}

export const useDriverLiveVisibilityStore = create<DriverLiveVisibilityState>((set) => ({
  isVisible: true,
  setVisible: (visible) => set((state) => (state.isVisible === visible ? state : { isVisible: visible })),
  toggleVisible: () => set((state) => ({ isVisible: !state.isVisible })),
}))

export const selectDriverLiveVisibility = (state: DriverLiveVisibilityState) => state.isVisible
