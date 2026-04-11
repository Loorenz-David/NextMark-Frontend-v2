import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useGetTeamMembers } from '@/features/team/members/api/teamMemberApi'
import type { TeamMemberQueryFilters } from '@/features/team/members/types/teamMemberMeta'
import { insertTeamMembers } from '@/features/team/members/store/teamMemberStore'
import {
  setTeamMemberListError,
  setTeamMemberListLoading,
  setTeamMemberListResult,
} from '@/features/team/members/store/teamMemberListStore'

import { useTeamMemberModel } from '../domain/useTeamMemberModel'

const buildQueryKey = (query?: TeamMemberQueryFilters) => JSON.stringify(query ?? {})

export const useTeamMembersFlow = (query?: TeamMemberQueryFilters) => {
  const getMembers = useGetTeamMembers()
  const { showMessage } = useMessageHandler()
  const { normalizeTeamMember } = useTeamMemberModel()

  const loadMembers = useCallback(async () => {
    const queryKey = buildQueryKey(query)
    setTeamMemberListLoading(true)
    setTeamMemberListError(undefined)

    try {
      const response = await getMembers(query)
      const payload = response.data

      if (!payload?.team_members) {
        setTeamMemberListError('Missing team members response.')
        return null
      }

      const normalized = normalizeTeamMember(payload.team_members)
      if (normalized) {
        insertTeamMembers(normalized)
      }

      setTeamMemberListResult({
        queryKey,
        query,
        pagination: payload.team_members_pagination,
      })

      return payload
    } catch (error) {
      console.error('Failed to load team members', error)
      setTeamMemberListError('Unable to load team members.')
      showMessage({ status: 500, message: 'Unable to load team members.' })
      return null
    } finally {
      setTeamMemberListLoading(false)
    }
  }, [getMembers, normalizeTeamMember, query, showMessage])

  

  return { loadMembers }
}
