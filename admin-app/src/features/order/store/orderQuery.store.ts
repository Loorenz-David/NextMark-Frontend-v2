import { createQueryStore } from "@shared-store";
import type { OrderQueryFilters } from "../types/orderMeta";
import { useShallow } from "zustand/react/shallow";



export const useOrderQueryStore = createQueryStore<OrderQueryFilters>({
    filters: {
        unschedule_order:true
    }
})

export const selectOrderQuery = (state: ReturnType<typeof useOrderQueryStore.getState>) => ({
  q: state.search,
  filters: state.filters
})

export const useOrderQuery = () =>
  useOrderQueryStore(useShallow(selectOrderQuery))

export const setQuerySearch = ( search: string) => 
    useOrderQueryStore.getState().setSearch(search)

export const setQueryFilters = (filters: OrderQueryFilters) => 
    useOrderQueryStore.getState().setFilters(filters)

export const updateQueryFilters = (filters: Partial<OrderQueryFilters>) =>
    useOrderQueryStore.getState().updateFilters(filters)

export const deleteQueryFilter = (key: keyof OrderQueryFilters) =>
    useOrderQueryStore.getState().deleteFilter(key)
    
export const resetQuery = () => useOrderQueryStore.getState().reset()


export const getQuerySearch = () => useOrderQueryStore.getState().search

export const getQueryFilters = () => useOrderQueryStore.getState().filters
