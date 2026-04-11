import { createListStore } from "@shared-store"
import type { ListState } from "@shared-store"

import type { OrderCasePagination, OrderCaseQueryFilters, OrderCaseStats } from '../types/orderCaseMeta'


export const useOrderCaseListStore = createListStore<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>()

export const selectOrderCaseListStats = (state: ListState<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>) => state.stats

export const useOrderCaseListPagination = (
  state: ListState<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>,
) => state.pagination

export const useOrderCaseListQuery = (state: ListState<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>) => state.query

export const useOrderCaseListtLoading = (state: ListState<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>) =>
  state.isLoading

export const useOrderCaseListError = (state: ListState<OrderCaseStats, OrderCaseQueryFilters, OrderCasePagination>) =>
  state.error

export const setOrderCaseListResult = (payload: {
  queryKey: string
  query?: OrderCaseQueryFilters
  stats?: OrderCaseStats
  pagination?: OrderCasePagination
}) => useOrderCaseListStore.getState().setResult(payload)

export const setOrderListLoading = (loading: boolean) => useOrderCaseListStore.getState().setLoading(loading)

export const setOrderListError = (error?: string) => useOrderCaseListStore.getState().setError(error)

export const clearOrderList = () => useOrderCaseListStore.getState().clear()


export const  useOrderStats = ()=> useOrderCaseListStore(selectOrderCaseListStats)