import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { apiClient } from '@/lib/api/ApiClient'

import {
  useUpdateTeamInviteAcceptance,
  useUpdateTeamInviteRejection,
} from '@/features/team/invitations/api/teamInvitationApi'
import {
  removeTeamInviteReceived,
  selectTeamInviteReceivedByServerId,
  useTeamInvitesReceivedStore,
} from '@/features/team/invitations/store/teamInvitesReceivedStore'

export const useTeamInvitationActions = () => {
  
  const acceptInvite = useUpdateTeamInviteAcceptance()
  const rejectInvite = useUpdateTeamInviteRejection()
  const { showMessage } = useMessageHandler()

  const acceptInvitation = useCallback(
    async (inviteId: number) => {
      const invite = selectTeamInviteReceivedByServerId(inviteId)(useTeamInvitesReceivedStore.getState())
      if (!invite) {
        showMessage({ status: 404, message: 'Invitation not found.' })
        return false
      }

      removeTeamInviteReceived(invite.client_id)

      try {
        const response = await acceptInvite(inviteId)
        const tokens = response.data
        if (tokens?.access_token && tokens?.refresh_token) {
          apiClient.replaceTokens(tokens.access_token, tokens.refresh_token, tokens.socket_token, tokens.user ?? null)
          window.location.reload()
          return true
        }

        return true
      } catch (error) {
        console.error('Failed to accept invitation', error)
        useTeamInvitesReceivedStore.getState().insert(invite)
        showMessage({ status: 500, message: 'Unable to accept invitation.' })
        return false
      }
    },
    [acceptInvite, showMessage],
  )

  const rejectInvitation = useCallback(
    async (inviteId: number) => {
      const invite = selectTeamInviteReceivedByServerId(inviteId)(useTeamInvitesReceivedStore.getState())
      if (!invite) {
        showMessage({ status: 404, message: 'Invitation not found.' })
        return false
      }

      removeTeamInviteReceived(invite.client_id)

      try {
        await rejectInvite(inviteId)
        return true
      } catch (error) {
        console.error('Failed to reject invitation', error)
        useTeamInvitesReceivedStore.getState().insert(invite)
        showMessage({ status: 500, message: 'Unable to reject invitation.' })
        return false
      }
    },
    [rejectInvite, showMessage],
  )

  return { acceptInvitation, rejectInvitation }
}
