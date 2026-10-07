import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { ApiError, apiClient } from '@/lib/api/ApiClient'

import {
  TEAM_MEMBERSHIP_CONFLICT_CODE,
  useUpdateTeamInviteAcceptance,
  useUpdateTeamInviteRejection,
} from '@/features/team/invitations/api/teamInvitationApi'
import type { TeamInviteAcceptOptions } from '@/features/team/invitations/api/teamInvitationApi'
import {
  removeTeamInviteReceived,
  selectTeamInviteReceivedByServerId,
  useTeamInvitesReceivedStore,
} from '@/features/team/invitations/store/teamInvitesReceivedStore'

export type TeamInviteAcceptOutcome = 'accepted' | 'requires_team_switch' | 'failed'

export const useTeamInvitationActions = () => {

  const acceptInvite = useUpdateTeamInviteAcceptance()
  const rejectInvite = useUpdateTeamInviteRejection()
  const { showMessage } = useMessageHandler()

  const acceptInvitation = useCallback(
    async (inviteId: number, options?: TeamInviteAcceptOptions): Promise<TeamInviteAcceptOutcome> => {
      const invite = selectTeamInviteReceivedByServerId(inviteId)(useTeamInvitesReceivedStore.getState())
      if (!invite) {
        showMessage({ status: 404, message: 'Invitation not found.' })
        return 'failed'
      }

      removeTeamInviteReceived(invite.client_id)

      try {
        const response = await acceptInvite(inviteId, options)
        const tokens = response.data
        if (tokens?.access_token && tokens?.refresh_token) {
          apiClient.replaceTokens(tokens.access_token, tokens.refresh_token, tokens.socket_token, tokens.user ?? null)
          window.location.reload()
        }

        return 'accepted'
      } catch (error) {
        useTeamInvitesReceivedStore.getState().insert(invite)

        if (error instanceof ApiError && error.payload?.code === TEAM_MEMBERSHIP_CONFLICT_CODE) {
          return 'requires_team_switch'
        }

        console.error('Failed to accept invitation', error)
        const message = error instanceof ApiError ? error.message : 'Unable to accept invitation.'
        showMessage({ status: 500, message })
        return 'failed'
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
