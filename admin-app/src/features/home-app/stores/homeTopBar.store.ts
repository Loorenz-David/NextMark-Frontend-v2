import { create } from 'zustand'

type HomeTopBarState = {
  /** The top bar is folded away. It starts folded and is opened on demand. */
  isHidden: boolean
  setHidden: (hidden: boolean) => void
}

export const useHomeTopBarStore = create<HomeTopBarState>((set) => ({
  isHidden: true,
  setHidden: (hidden) => set({ isHidden: hidden }),
}))
