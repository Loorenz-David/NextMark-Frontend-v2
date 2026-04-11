import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'
import type { TeamMember, TeamMemberMap, TeamMemberRoleChange } from '../types/teamMember'
import type { TeamMemberPagination, TeamMemberQueryFilters } from '../types/teamMemberMeta'

export type TeamMemberListResponse = {
  team_members: TeamMemberMap
  team_members_pagination: TeamMemberPagination
}

export type TeamMemberDetailResponse = {
  team_member: TeamMemberMap | TeamMember
}

export type TeamNameUpdateResponse = {
  team: {
    id: number
    name: string
  }
}

export const teamMemberApi = {
  listTeamMembers: (query?: TeamMemberQueryFilters): Promise<ApiResult<TeamMemberListResponse>> =>
    apiClient.request<TeamMemberListResponse>({
      path: '/teams/members/',
      method: 'GET',
      query,
    }),

  getTeamMember: (userId: number | string): Promise<ApiResult<TeamMemberDetailResponse>> =>
    apiClient.request<TeamMemberDetailResponse>({
      path: `/teams/members/${userId}`,
      method: 'GET',
    }),

  leaveTeam: (): Promise<ApiResult<{
    access_token: string
    refresh_token: string
    socket_token: string
    user?: Record<string, unknown> | null
  }>> =>
    apiClient.request<{
      access_token: string
      refresh_token: string
      socket_token: string
      user?: Record<string, unknown> | null
    }>({
      path: '/teams/members/leave/',
      method: 'POST',
    }),

  kickTeamMember: (userId: number | string): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: `/teams/members/kick/${userId}`,
      method: 'POST',
    }),

  changeMemberRole: (payload: TeamMemberRoleChange): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
      path: '/teams/members/role/',
      method: 'POST',
      data: { fields: payload },
    }),

  updateTeamName: (name: string): Promise<ApiResult<TeamNameUpdateResponse>> =>
    apiClient.request<TeamNameUpdateResponse>({
      path: '/teams/change-name',
      method: 'POST',
      data: { name },
    }),
}

export const useGetTeamMembers = () =>
  useCallback((query?: TeamMemberQueryFilters) => teamMemberApi.listTeamMembers(query), [])

export const useGetTeamMember = () =>
  useCallback((userId: number | string) => teamMemberApi.getTeamMember(userId), [])

export const useUpdateTeamMemberRole = () =>
  useCallback((payload: TeamMemberRoleChange) => teamMemberApi.changeMemberRole(payload), [])

export const useUpdateTeamMemberRemoval = () =>
  useCallback((userId: number | string) => teamMemberApi.kickTeamMember(userId), [])

export const useUpdateTeamMemberLeave = () =>
  useCallback(() => teamMemberApi.leaveTeam(), [])

export const useUpdateTeamName = () =>
  useCallback((name: string) => teamMemberApi.updateTeamName(name), [])
