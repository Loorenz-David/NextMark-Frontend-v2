import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import {
  loadDesktopMapVisible,
  saveDesktopMapVisible,
} from './homeDesktopLayout.storage'

type HomeDesktopLayoutState = {
  /** Whether the desktop map column is unfolded. Persisted across reloads. */
  isMapVisible: boolean
  showMap: () => void
  hideMap: () => void
}

export const useHomeDesktopLayoutStore = create<HomeDesktopLayoutState>((set) => ({
  isMapVisible: loadDesktopMapVisible(),
  showMap: () => {
    saveDesktopMapVisible(true)
    set({ isMapVisible: true })
  },
  hideMap: () => {
    saveDesktopMapVisible(false)
    set({ isMapVisible: false })
  },
}))

export const useIsDesktopMapVisible = (): boolean =>
  useHomeDesktopLayoutStore((state) => state.isMapVisible)

export const useDesktopMapActions = () =>
  useHomeDesktopLayoutStore(
    useShallow((state) => ({
      showMap: state.showMap,
      hideMap: state.hideMap,
    })),
  )
