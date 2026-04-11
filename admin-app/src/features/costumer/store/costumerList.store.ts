import { createListStore } from "@shared-store"
import type { ListState } from "@shared-store"

import type { CostumerPagination, CostumerQueryFilters, CostumerStats } from '../dto/costumer.dto'

export const useCostumerListStore = createListStore<CostumerStats, CostumerQueryFilters, CostumerPagination>()

export const selectCostumerListStats =
  (state: ListState<CostumerStats, CostumerQueryFilters, CostumerPagination>) => state.stats

export const selectCostumerListPagination =
  (state: ListState<CostumerStats, CostumerQueryFilters, CostumerPagination>) => state.pagination

export const selectCostumerListQuery =
  (state: ListState<CostumerStats, CostumerQueryFilters, CostumerPagination>) => state.query

export const selectCostumerListLoading =
  (state: ListState<CostumerStats, CostumerQueryFilters, CostumerPagination>) => state.isLoading

export const selectCostumerListError =
  (state: ListState<CostumerStats, CostumerQueryFilters, CostumerPagination>) => state.error

export const setCostumerListResult = (payload: {
  queryKey: string
  query?: CostumerQueryFilters
  stats?: CostumerStats
  pagination?: CostumerPagination
}) => useCostumerListStore.getState().setResult(payload)

export const setCostumerListLoading = (loading: boolean) => useCostumerListStore.getState().setLoading(loading)

export const setCostumerListError = (error?: string) => useCostumerListStore.getState().setError(error)

export const clearCostumerList = () => useCostumerListStore.getState().clear()
