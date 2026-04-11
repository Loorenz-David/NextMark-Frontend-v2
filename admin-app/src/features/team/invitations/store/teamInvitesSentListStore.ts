import type { ListState } from "@shared-store"
import type { TeamInvitePagination, TeamInviteSentQueryFilters } from '@/features/team/invitations/types/teamInvitationMeta'

import { createListStore } from "@shared-store"

export const useTeamInvitesSentListStore = createListStore<Record<string, never>, TeamInviteSentQueryFilters, TeamInvitePagination>()

export const selectTeamInvitesSentPagination = (
  state: ListState<Record<string, never>, TeamInviteSentQueryFilters, TeamInvitePagination>,
) => state.pagination

export const selectTeamInvitesSentQuery = (
  state: ListState<Record<string, never>, TeamInviteSentQueryFilters, TeamInvitePagination>,
) => state.query

export const selectTeamInvitesSentLoading = (
  state: ListState<Record<string, never>, TeamInviteSentQueryFilters, TeamInvitePagination>,
) => state.isLoading

export const selectTeamInvitesSentError = (
  state: ListState<Record<string, never>, TeamInviteSentQueryFilters, TeamInvitePagination>,
) => state.error

export const setTeamInvitesSentResult = (payload: {
  queryKey: string
  query?: TeamInviteSentQueryFilters
  pagination?: TeamInvitePagination
}) => useTeamInvitesSentListStore.getState().setResult(payload)

export const setTeamInvitesSentLoading = (loading: boolean) =>
  useTeamInvitesSentListStore.getState().setLoading(loading)

export const setTeamInvitesSentError = (error?: string) =>
  useTeamInvitesSentListStore.getState().setError(error)

export const clearTeamInvitesSentList = () =>
  useTeamInvitesSentListStore.getState().clear()
