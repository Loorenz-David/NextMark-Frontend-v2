import type { ListState } from "@shared-store"
import type { OrderStateTransitionRulePagination, OrderStateTransitionRuleQueryFilters } from '@/features/role/roleRules/types/roleRuleMeta'

import { createListStore } from "@shared-store"

export const useOrderStateTransitionRuleListStore =
  createListStore<Record<string, never>, OrderStateTransitionRuleQueryFilters, OrderStateTransitionRulePagination>()

export const selectOrderStateTransitionRuleListPagination = (
  state: ListState<Record<string, never>, OrderStateTransitionRuleQueryFilters, OrderStateTransitionRulePagination>,
) => state.pagination

export const selectOrderStateTransitionRuleListQuery = (
  state: ListState<Record<string, never>, OrderStateTransitionRuleQueryFilters, OrderStateTransitionRulePagination>,
) => state.query

export const selectOrderStateTransitionRuleListLoading = (
  state: ListState<Record<string, never>, OrderStateTransitionRuleQueryFilters, OrderStateTransitionRulePagination>,
) => state.isLoading

export const selectOrderStateTransitionRuleListError = (
  state: ListState<Record<string, never>, OrderStateTransitionRuleQueryFilters, OrderStateTransitionRulePagination>,
) => state.error

export const setOrderStateTransitionRuleListResult = (payload: {
  queryKey: string
  query?: OrderStateTransitionRuleQueryFilters
  pagination?: OrderStateTransitionRulePagination
}) => useOrderStateTransitionRuleListStore.getState().setResult(payload)

export const setOrderStateTransitionRuleListLoading = (loading: boolean) =>
  useOrderStateTransitionRuleListStore.getState().setLoading(loading)

export const setOrderStateTransitionRuleListError = (error?: string) =>
  useOrderStateTransitionRuleListStore.getState().setError(error)

export const clearOrderStateTransitionRuleList = () =>
  useOrderStateTransitionRuleListStore.getState().clear()
