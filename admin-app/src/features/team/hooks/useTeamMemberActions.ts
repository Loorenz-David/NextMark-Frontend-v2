import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { apiClient } from '@/lib/api/ApiClient'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import { useUpdateTeamMemberLeave, useUpdateTeamMemberRemoval } from '../members/api/teamMemberApi'
import {
  removeTeamMember,
  selectTeamMemberByServerId,
  useTeamMemberStore,
} from '../members/store/teamMemberStore'

export const useTeamMemberActions = () => {
  const popupManager = usePopupManager()
  const { showMessage } = useMessageHandler()
  const removeMember = useUpdateTeamMemberRemoval()
  const leaveTeam = useUpdateTeamMemberLeave()
  const currentUserId = apiClient.getSessionUserId()

  const openInvitePopup = useCallback(() => {
    popupManager.open({ key: 'team.invite.create', parentParams: { autoHeight: true } })
  }, [popupManager])

  const kickMember = useCallback(async (memberId: number) => {
    const member = selectTeamMemberByServerId(memberId)(useTeamMemberStore.getState())
    if (!member) {
      showMessage({ status: 404, message: 'Member not found.' })
      return false
    }

    removeTeamMember(member.client_id)

    try {
      await removeMember(memberId)
      return true
    } catch (error) {
      console.error('Failed to remove team member', error)
      useTeamMemberStore.getState().insert(member)
      showMessage({ status: 500, message: 'Unable to remove team member.' })
      return false
    }
  }, [removeMember, showMessage])

  const leaveCurrentTeam = useCallback(async () => {
    try {
      const response = await leaveTeam()
      const tokens = response.data
      if (tokens?.access_token && tokens?.refresh_token) {
        apiClient.replaceTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.socket_token,
          tokens.user ?? null,
        )
        window.location.reload()
      }
      return true
    } catch (error) {
      console.error('Failed to leave team', error)
      showMessage({ status: 500, message: 'Unable to leave team.' })
      return false
    }
  }, [leaveTeam, showMessage])

  const canKickMember = useCallback(
    (memberId: number | null | undefined) =>
      memberId !== null &&
      memberId !== undefined &&
      String(memberId) !== String(currentUserId),
    [currentUserId],
  )

  return { openInvitePopup, kickMember, leaveCurrentTeam, canKickMember }
}
