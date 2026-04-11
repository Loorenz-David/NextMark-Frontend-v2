import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import type {
  TeamInviteReceived,
  TeamInviteReceivedMap,
  TeamInviteSent,
  TeamInviteSentMap,
} from '@/features/team/invitations/types/teamInvitation'

export const useTeamInvitationModel = () => ({
  normalizeInviteSent: (payload: TeamInviteSentMap | TeamInviteSent | null | undefined) =>
    normalizeEntityMap<TeamInviteSent>(payload ?? null),
  normalizeInviteReceived: (
    payload: TeamInviteReceivedMap | TeamInviteReceived | null | undefined,
  ) => normalizeEntityMap<TeamInviteReceived>(payload ?? null),
})
