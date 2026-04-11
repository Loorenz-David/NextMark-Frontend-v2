import type { ListState } from "@shared-store"
import type { PlanPagination, PlanQueryFilters, PlanStats } from '@/features/plan/types/planMeta'

import { createListStore } from "@shared-store"

export const useRoutePlanListStore = createListStore<PlanStats, PlanQueryFilters, PlanPagination>()

export const selectRoutePlanListStats = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.stats

export const selectRoutePlanListPagination = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) =>
  state.pagination

export const selectRoutePlanListQuery = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.query

export const selectRoutePlanListLoading = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.isLoading

export const selectRoutePlanListError = (state: ListState<PlanStats, PlanQueryFilters, PlanPagination>) => state.error

export const setRoutePlanListResult = (payload: {
  queryKey: string
  query?: PlanQueryFilters
  stats?: PlanStats
  pagination?: PlanPagination
}) => useRoutePlanListStore.getState().setResult(payload)

export const setRoutePlanListLoading = (loading: boolean) => useRoutePlanListStore.getState().setLoading(loading)

export const setRoutePlanListError = (error?: string) => useRoutePlanListStore.getState().setError(error)

export const clearRoutePlanList = () => useRoutePlanListStore.getState().clear()

export const incrementRoutePlanListTotal = () =>
  useRoutePlanListStore.setState((state) => {
    if (!state.stats) {
      return state
    }

    return {
      ...state,
      stats: {
        ...state.stats,
        plans: {
          ...state.stats.plans,
          total: state.stats.plans.total + 1,
        },
      },
    }
  })


