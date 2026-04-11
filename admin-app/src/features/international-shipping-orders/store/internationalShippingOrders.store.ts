import { create } from 'zustand'

interface InternationalShippingOrdersState {
  // Placeholder state structure
  isInitialized: boolean
  setIsInitialized: (value: boolean) => void
}

export const useInternationalShippingOrdersStore = create<InternationalShippingOrdersState>((set) => ({
  isInitialized: false,
  setIsInitialized: (value: boolean) => set({ isInitialized: value }),
}))
