import type { ListState } from "@shared-store"
import type { DateRangeAccessRulePagination, DateRangeAccessRuleQueryFilters } from '@/features/role/roleRules/types/roleRuleMeta'

import { createListStore } from "@shared-store"

export const useDateRangeAccessRuleListStore =
  createListStore<Record<string, never>, DateRangeAccessRuleQueryFilters, DateRangeAccessRulePagination>()

export const selectDateRangeAccessRuleListPagination = (
  state: ListState<Record<string, never>, DateRangeAccessRuleQueryFilters, DateRangeAccessRulePagination>,
) => state.pagination

export const selectDateRangeAccessRuleListQuery = (
  state: ListState<Record<string, never>, DateRangeAccessRuleQueryFilters, DateRangeAccessRulePagination>,
) => state.query

export const selectDateRangeAccessRuleListLoading = (
  state: ListState<Record<string, never>, DateRangeAccessRuleQueryFilters, DateRangeAccessRulePagination>,
) => state.isLoading

export const selectDateRangeAccessRuleListError = (
  state: ListState<Record<string, never>, DateRangeAccessRuleQueryFilters, DateRangeAccessRulePagination>,
) => state.error

export const setDateRangeAccessRuleListResult = (payload: {
  queryKey: string
  query?: DateRangeAccessRuleQueryFilters
  pagination?: DateRangeAccessRulePagination
}) => useDateRangeAccessRuleListStore.getState().setResult(payload)

export const setDateRangeAccessRuleListLoading = (loading: boolean) =>
  useDateRangeAccessRuleListStore.getState().setLoading(loading)

export const setDateRangeAccessRuleListError = (error?: string) =>
  useDateRangeAccessRuleListStore.getState().setError(error)

export const clearDateRangeAccessRuleList = () =>
  useDateRangeAccessRuleListStore.getState().clear()
