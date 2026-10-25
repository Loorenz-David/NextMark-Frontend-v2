import { create } from 'zustand'

import { loadHomeTopBarHidden, saveHomeTopBarHidden } from './homeTopBar.storage'

type HomeTopBarState = {
  /** The top bar is folded away; remembered on this device. */
  isHidden: boolean
  setHidden: (hidden: boolean) => void
}

export const useHomeTopBarStore = create<HomeTopBarState>((set) => ({
  isHidden: loadHomeTopBarHidden(),
  setHidden: (hidden) => {
    saveHomeTopBarHidden(hidden)
    set({ isHidden: hidden })
  },
}))
