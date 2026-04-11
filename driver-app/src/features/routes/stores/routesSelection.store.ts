import { create } from 'zustand'

export type RoutesSelectionStoreState = {
  selectedRouteClientId: string | null
  setSelectedRouteClientId: (routeClientId: string | null) => void
  clearSelectedRouteClientId: () => void
}

export const useRoutesSelectionStore = create<RoutesSelectionStoreState>((set) => ({
  selectedRouteClientId: null,
  setSelectedRouteClientId: (routeClientId) => {
    set(() => ({ selectedRouteClientId: routeClientId }))
  },
  clearSelectedRouteClientId: () => {
    set(() => ({ selectedRouteClientId: null }))
  },
}))
