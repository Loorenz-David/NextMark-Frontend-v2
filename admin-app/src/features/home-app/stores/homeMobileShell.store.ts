import { create } from 'zustand'

import { DEFAULT_HOME_MOBILE_TAB } from '../domain/homeMobileShell.domain'
import type { HomeMobileTabId } from '../domain/homeMobileShell.types'

type HomeMobileShellState = {
  activeTab: HomeMobileTabId
  /** Tabs mounted so far; a tab mounts on first visit and then stays alive to keep its scroll and filters. */
  mountedTabs: readonly HomeMobileTabId[]
  setActiveTab: (tab: HomeMobileTabId) => void
  reset: () => void
}

export const useHomeMobileShellStore = create<HomeMobileShellState>((set) => ({
  activeTab: DEFAULT_HOME_MOBILE_TAB,
  mountedTabs: [DEFAULT_HOME_MOBILE_TAB],
  setActiveTab: (tab) =>
    set((state) => ({
      activeTab: tab,
      mountedTabs: state.mountedTabs.includes(tab) ? state.mountedTabs : [...state.mountedTabs, tab],
    })),
  reset: () =>
    set({
      activeTab: DEFAULT_HOME_MOBILE_TAB,
      mountedTabs: [DEFAULT_HOME_MOBILE_TAB],
    }),
}))
