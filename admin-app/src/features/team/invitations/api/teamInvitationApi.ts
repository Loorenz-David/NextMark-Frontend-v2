import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type {
  ClientIdMap,
  TeamInviteCreatePayload,
  TeamInviteReceived,
  TeamInviteReceivedMap,
  TeamInviteSent,
  TeamInviteSentMap,
} from '@/features/team/invitations/types/teamInvitation'
import type {
  TeamInvitePagination,
  TeamInviteReceivedQueryFilters,
  TeamInviteSentQueryFilters,
} from '@/features/team/invitations/types/teamInvitationMeta'
import type { SessionUser } from '@/features/auth/login/store/sessionStorage'

export type TeamInviteSentListResponse = {
  team_invites_sent: TeamInviteSentMap
  team_invites_sent_pagination: TeamInvitePagination
}

export type TeamInviteReceivedListResponse = {
  team_invites_received: TeamInviteReceivedMap
  team_invites_received_pagination: TeamInvitePagination
}

export type TeamInviteSentDetailResponse = {
  team_invite_sent: TeamInviteSentMap | TeamInviteSent
}

export type TeamInviteReceivedDetailResponse = {
  team_invite_received: TeamInviteReceivedMap | TeamInviteReceived
}

export type TeamInviteAcceptResponse = {
  access_token: string
  refresh_token: string
  socket_token: string
  user?: SessionUser | null
}

export const teamInvitationApi = {
  listInvitesSent: (query?: TeamInviteSentQueryFilters): Promise<ApiResult<TeamInviteSentListResponse>> =>
    apiClient.request<TeamInviteSentListResponse>({
      path: '/team_invitations/sent/',
      method: 'GET',
      query,
    }),

  getInviteSent: (inviteId: number | string): Promise<ApiResult<TeamInviteSentDetailResponse>> =>
    apiClient.request<TeamInviteSentDetailResponse>({
      path: `/team_invitations/sent/${inviteId}`,
      method: 'GET',
    }),

  listInvitesReceived: (query?: TeamInviteReceivedQueryFilters): Promise<ApiResult<TeamInviteReceivedListResponse>> =>
    apiClient.request<TeamInviteReceivedListResponse>({
      path: '/team_invitations/received/',
      method: 'GET',
      query,
    }),

  getInviteReceived: (inviteId: number | string): Promise<ApiResult<TeamInviteReceivedDetailResponse>> =>
    apiClient.request<TeamInviteReceivedDetailResponse>({
      path: `/team_invitations/received/${inviteId}`,
      method: 'GET',
    }),

  createInvitation: (payload: TeamInviteCreatePayload): Promise<ApiResult<{ team_invites: ClientIdMap }>> =>
    apiClient.request<{ team_invites: ClientIdMap }>({
      path: '/team_invitations/',
      method: 'POST',
      data: { fields: payload },
    }),

  acceptInvitation: (inviteId: number | string): Promise<ApiResult<TeamInviteAcceptResponse>> =>
    apiClient.request<TeamInviteAcceptResponse>({
      path: `/team_invitations/accept/${inviteId}`,
      method: 'POST',
    }),

  deleteInvitation: (inviteId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/team_invitations/${inviteId}`,
      method: 'DELETE',
    }),
}

export const useGetTeamInvitesSent = () =>
  useCallback((query?: TeamInviteSentQueryFilters) => teamInvitationApi.listInvitesSent(query), [])

export const useGetTeamInvitesReceived = () =>
  useCallback((query?: TeamInviteReceivedQueryFilters) => teamInvitationApi.listInvitesReceived(query), [])

export const useCreateTeamInvite = () =>
  useCallback((payload: TeamInviteCreatePayload) => teamInvitationApi.createInvitation(payload), [])

export const useUpdateTeamInviteAcceptance = () =>
  useCallback((inviteId: number | string) => teamInvitationApi.acceptInvitation(inviteId), [])

export const useUpdateTeamInviteRejection = () =>
  useCallback((inviteId: number | string) => teamInvitationApi.deleteInvitation(inviteId), [])
