import { create } from 'zustand'

type CostumerDetailUIState = {
  loadingOrdersByCostumerId: Map<number, string | null>
  setLoadingOrders: (costumerId: number, label: string | null) => void
}

export const useCostumerDetailUIStore = create<CostumerDetailUIState>((set) => ({
  loadingOrdersByCostumerId: new Map<number, string | null>(),
  setLoadingOrders: (costumerId, label) =>
    set((state) => {
      const nextMap = new Map(state.loadingOrdersByCostumerId)
      nextMap.set(costumerId, label)
      return { loadingOrdersByCostumerId: nextMap }
    }),
}))

export const setLoadingOrders = (costumerId: number, label: string | null) =>
  useCostumerDetailUIStore.getState().setLoadingOrders(costumerId, label)

export const useCostumerOrdersLoading = (costumerId: number | null): string | null =>
  useCostumerDetailUIStore((state) =>
    typeof costumerId === 'number' ? state.loadingOrdersByCostumerId.get(costumerId) ?? null : null,
  )
