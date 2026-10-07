import { createQueryStore } from "@shared-store";
import type { OrderQueryFilters } from "../types/orderMeta";
import { useShallow } from "zustand/react/shallow";
import { normalizeOrderQueryFilters } from "../domain/orderFilterPanel.domain";

const DEFAULT_ORDER_QUERY_FILTERS: OrderQueryFilters = {
  unschedule_order: true,
};

export const useOrderQueryStore = createQueryStore<OrderQueryFilters>({
  filters: { ...DEFAULT_ORDER_QUERY_FILTERS },
});

export const selectOrderQuery = (state: ReturnType<typeof useOrderQueryStore.getState>) => ({
  q: state.search,
  filters: state.filters
})

export const useOrderQuery = () =>
  useOrderQueryStore(useShallow(selectOrderQuery))

export const setQuerySearch = ( search: string) => 
    useOrderQueryStore.getState().setSearch(search)

export const setQueryFilters = (filters: OrderQueryFilters) =>
    useOrderQueryStore.getState().setFilters(normalizeOrderQueryFilters(filters))

export const updateQueryFilters = (filters: Partial<OrderQueryFilters>) =>
    useOrderQueryStore.getState().setFilters(
      normalizeOrderQueryFilters({
        ...useOrderQueryStore.getState().filters,
        ...filters,
      }),
    )

export const deleteQueryFilter = (key: keyof OrderQueryFilters) =>
    useOrderQueryStore.getState().deleteFilter(key)
    
export const resetQuery = () =>
{
  const state = useOrderQueryStore.getState()
  state.setSearch("")
  state.setFilters({ ...DEFAULT_ORDER_QUERY_FILTERS })
}


export const getQuerySearch = () => useOrderQueryStore.getState().search

export const getQueryFilters = () => useOrderQueryStore.getState().filters
