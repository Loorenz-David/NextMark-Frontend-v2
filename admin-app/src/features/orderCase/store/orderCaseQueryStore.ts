import { useShallow } from 'zustand/react/shallow'

import { createQueryStore } from "@shared-store"

import type { OrderCaseQueryFilters } from '../types'

export const useOrderCaseQueryStore = createQueryStore<OrderCaseQueryFilters>()

export const selectOrderCaseQuery = (state: ReturnType<typeof useOrderCaseQueryStore.getState>) => ({
  q: state.search,
  filters: state.filters,
})

export const useOrderCaseQuery = () =>
  useOrderCaseQueryStore(useShallow(selectOrderCaseQuery))

export const setOrderCaseQuerySearch = (search: string) =>
  useOrderCaseQueryStore.getState().setSearch(search)

export const setOrderCaseQueryFilters = (filters: OrderCaseQueryFilters) =>
  useOrderCaseQueryStore.getState().setFilters(filters)

export const updateOrderCaseQueryFilters = (filters: Partial<OrderCaseQueryFilters>) =>
  useOrderCaseQueryStore.getState().updateFilters(filters)

export const deleteOrderCaseQueryFilter = (key: keyof OrderCaseQueryFilters) =>
  useOrderCaseQueryStore.getState().deleteFilter(key)

export const resetOrderCaseQuery = () => useOrderCaseQueryStore.getState().reset()
