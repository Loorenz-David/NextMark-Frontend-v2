import { useCallback, useState } from 'react'

import { useTeamInvitationActions } from './useTeamInvitationActions'

export const useTeamInvitationAcceptController = () => {
  const { acceptInvitation, rejectInvitation } = useTeamInvitationActions()
  const [pendingTeamSwitchInviteId, setPendingTeamSwitchInviteId] = useState<number | null>(null)

  const requestAcceptInvitation = useCallback(
    async (inviteId: number) => {
      const outcome = await acceptInvitation(inviteId)
      if (outcome === 'requires_team_switch') {
        setPendingTeamSwitchInviteId(inviteId)
      }
    },
    [acceptInvitation],
  )

  const confirmTeamSwitch = useCallback(async () => {
    if (pendingTeamSwitchInviteId === null) return

    const inviteId = pendingTeamSwitchInviteId
    setPendingTeamSwitchInviteId(null)
    await acceptInvitation(inviteId, { leaveCurrentTeam: true })
  }, [acceptInvitation, pendingTeamSwitchInviteId])

  const cancelTeamSwitch = useCallback(() => {
    setPendingTeamSwitchInviteId(null)
  }, [])

  return {
    requestAcceptInvitation,
    rejectInvitation,
    isTeamSwitchPending: pendingTeamSwitchInviteId !== null,
    confirmTeamSwitch,
    cancelTeamSwitch,
  }
}
