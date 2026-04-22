import { createQueryStore } from "@shared-store";
import type { OrderQueryFilters } from "../types/orderMeta";
import { useShallow } from "zustand/react/shallow";
import {
  HIDDEN_ORDER_QUERY_FILTERS,
  applyHiddenOrderQueryFilters,
} from "../domain/orderHiddenQueryFilters";

export const useOrderQueryStore = createQueryStore<OrderQueryFilters>({
    filters: {
        unschedule_order:true,
        ...HIDDEN_ORDER_QUERY_FILTERS,
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
    useOrderQueryStore.getState().setFilters(applyHiddenOrderQueryFilters(filters))

export const updateQueryFilters = (filters: Partial<OrderQueryFilters>) =>
    useOrderQueryStore.getState().updateFilters(applyHiddenOrderQueryFilters(filters))

export const deleteQueryFilter = (key: keyof OrderQueryFilters) =>
    useOrderQueryStore.getState().setFilters(
      applyHiddenOrderQueryFilters(
        Object.fromEntries(
          Object.entries(useOrderQueryStore.getState().filters).filter(
            ([filterKey]) => filterKey !== key,
          ),
        ) as OrderQueryFilters,
      ),
    )
    
export const resetQuery = () =>
{
  const state = useOrderQueryStore.getState()
  state.setSearch("")
  state.setFilters({
    unschedule_order: true,
    ...HIDDEN_ORDER_QUERY_FILTERS,
  })
}


export const getQuerySearch = () => useOrderQueryStore.getState().search

export const getQueryFilters = () =>
  applyHiddenOrderQueryFilters(useOrderQueryStore.getState().filters)
