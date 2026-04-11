import type { ListState } from "@shared-store"
import type { TeamMemberPagination, TeamMemberQueryFilters } from '../types/teamMemberMeta'

import { createListStore } from "@shared-store"

export const useTeamMemberListStore = createListStore<Record<string, never>, TeamMemberQueryFilters, TeamMemberPagination>()

export const selectTeamMemberListPagination = (
  state: ListState<Record<string, never>, TeamMemberQueryFilters, TeamMemberPagination>,
) => state.pagination

export const selectTeamMemberListQuery = (
  state: ListState<Record<string, never>, TeamMemberQueryFilters, TeamMemberPagination>,
) => state.query

export const selectTeamMemberListLoading = (
  state: ListState<Record<string, never>, TeamMemberQueryFilters, TeamMemberPagination>,
) => state.isLoading

export const selectTeamMemberListError = (
  state: ListState<Record<string, never>, TeamMemberQueryFilters, TeamMemberPagination>,
) => state.error

export const setTeamMemberListResult = (payload: {
  queryKey: string
  query?: TeamMemberQueryFilters
  pagination?: TeamMemberPagination
}) => useTeamMemberListStore.getState().setResult(payload)

export const setTeamMemberListLoading = (loading: boolean) =>
  useTeamMemberListStore.getState().setLoading(loading)

export const setTeamMemberListError = (error?: string) =>
  useTeamMemberListStore.getState().setError(error)

export const clearTeamMemberList = () =>
  useTeamMemberListStore.getState().clear()
