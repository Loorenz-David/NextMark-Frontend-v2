import { createListStore } from "@shared-store"
import type { ListState } from "@shared-store"

import type { OrderPagination, OrderQueryStoreFilters, OrderStats } from '../types/orderMeta'


export const useOrderListStore = createListStore<OrderStats, OrderQueryStoreFilters, OrderPagination>()

export const selectOrderListStats = (state: ListState<OrderStats, OrderQueryStoreFilters, OrderPagination>) => state.stats

export const selectOrderListPagination = (
  state: ListState<OrderStats, OrderQueryStoreFilters, OrderPagination>,
) => state.pagination

export const selectOrderListQuery = (state: ListState<OrderStats, OrderQueryStoreFilters, OrderPagination>) => state.query

export const selectOrderListLoading = (state: ListState<OrderStats, OrderQueryStoreFilters, OrderPagination>) =>
  state.isLoading

export const selectOrderListError = (state: ListState<OrderStats, OrderQueryStoreFilters, OrderPagination>) =>
  state.error

export const setOrderListResult = (payload: {
  queryKey: string
  query?: OrderQueryStoreFilters
  stats?: OrderStats
  pagination?: OrderPagination
}) => useOrderListStore.getState().setResult(payload)

export const setOrderListLoading = (loading: boolean) => useOrderListStore.getState().setLoading(loading)

export const setOrderListError = (error?: string) => useOrderListStore.getState().setError(error)

export const clearOrderList = () => useOrderListStore.getState().clear()


export const  useOrderStats = ()=> useOrderListStore(selectOrderListStats)
