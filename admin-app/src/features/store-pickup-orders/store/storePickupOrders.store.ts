import { create } from 'zustand'

interface StorePickupOrdersState {
  // Placeholder state structure
  isInitialized: boolean
  setIsInitialized: (value: boolean) => void
}

export const useStorePickupOrdersStore = create<StorePickupOrdersState>((set) => ({
  isInitialized: false,
  setIsInitialized: (value: boolean) => set({ isInitialized: value }),
}))
