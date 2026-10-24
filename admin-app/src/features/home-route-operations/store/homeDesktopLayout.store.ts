import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import {
  hasDesktopMapVisiblePreference,
  loadDesktopMapVisible,
  saveDesktopMapVisible,
} from './homeDesktopLayout.storage'

type HomeDesktopLayoutState = {
  /** Null means no saved preference; the viewport class supplies the default. */
  isMapVisible: boolean | null
  showMap: () => void
  hideMap: () => void
}

const loadMapVisibilityPreference = (): boolean | null =>
  hasDesktopMapVisiblePreference() ? loadDesktopMapVisible() : null

export const useHomeDesktopLayoutStore = create<HomeDesktopLayoutState>((set) => ({
  isMapVisible: loadMapVisibilityPreference(),
  showMap: () => {
    saveDesktopMapVisible(true)
    set({ isMapVisible: true })
  },
  hideMap: () => {
    saveDesktopMapVisible(false)
    set({ isMapVisible: false })
  },
}))

export const useIsDesktopMapVisible = (isTablet = false): boolean =>
  useHomeDesktopLayoutStore((state) => state.isMapVisible ?? !isTablet)

export const useDesktopMapActions = () =>
  useHomeDesktopLayoutStore(
    useShallow((state) => ({
      showMap: state.showMap,
      hideMap: state.hideMap,
    })),
  )
