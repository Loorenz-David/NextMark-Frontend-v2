import type { ListState } from "@shared-store"
import type { UserRolePagination, UserRoleQueryFilters } from '@/features/role/userRole/types/userRoleMeta'

import { createListStore } from "@shared-store"

export const useUserRoleListStore = createListStore<Record<string, never>, UserRoleQueryFilters, UserRolePagination>()

export const selectUserRoleListPagination = (
  state: ListState<Record<string, never>, UserRoleQueryFilters, UserRolePagination>,
) => state.pagination

export const selectUserRoleListQuery = (
  state: ListState<Record<string, never>, UserRoleQueryFilters, UserRolePagination>,
) => state.query

export const selectUserRoleListLoading = (
  state: ListState<Record<string, never>, UserRoleQueryFilters, UserRolePagination>,
) => state.isLoading

export const selectUserRoleListError = (
  state: ListState<Record<string, never>, UserRoleQueryFilters, UserRolePagination>,
) => state.error

export const setUserRoleListResult = (payload: {
  queryKey: string
  query?: UserRoleQueryFilters
  pagination?: UserRolePagination
}) => useUserRoleListStore.getState().setResult(payload)

export const setUserRoleListLoading = (loading: boolean) =>
  useUserRoleListStore.getState().setLoading(loading)

export const setUserRoleListError = (error?: string) =>
  useUserRoleListStore.getState().setError(error)

export const clearUserRoleList = () =>
  useUserRoleListStore.getState().clear()
