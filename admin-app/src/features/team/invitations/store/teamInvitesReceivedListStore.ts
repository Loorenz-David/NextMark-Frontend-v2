import type { ListState } from "@shared-store"
import type { TeamInvitePagination, TeamInviteReceivedQueryFilters } from '@/features/team/invitations/types/teamInvitationMeta'

import { createListStore } from "@shared-store"

export const useTeamInvitesReceivedListStore = createListStore<Record<string, never>, TeamInviteReceivedQueryFilters, TeamInvitePagination>()

export const selectTeamInvitesReceivedPagination = (
  state: ListState<Record<string, never>, TeamInviteReceivedQueryFilters, TeamInvitePagination>,
) => state.pagination

export const selectTeamInvitesReceivedQuery = (
  state: ListState<Record<string, never>, TeamInviteReceivedQueryFilters, TeamInvitePagination>,
) => state.query

export const selectTeamInvitesReceivedLoading = (
  state: ListState<Record<string, never>, TeamInviteReceivedQueryFilters, TeamInvitePagination>,
) => state.isLoading

export const selectTeamInvitesReceivedError = (
  state: ListState<Record<string, never>, TeamInviteReceivedQueryFilters, TeamInvitePagination>,
) => state.error

export const setTeamInvitesReceivedResult = (payload: {
  queryKey: string
  query?: TeamInviteReceivedQueryFilters
  pagination?: TeamInvitePagination
}) => useTeamInvitesReceivedListStore.getState().setResult(payload)

export const setTeamInvitesReceivedLoading = (loading: boolean) =>
  useTeamInvitesReceivedListStore.getState().setLoading(loading)

export const setTeamInvitesReceivedError = (error?: string) =>
  useTeamInvitesReceivedListStore.getState().setError(error)

export const clearTeamInvitesReceivedList = () =>
  useTeamInvitesReceivedListStore.getState().clear()
