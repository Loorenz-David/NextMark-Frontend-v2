import { useShallow } from 'zustand/react/shallow'

import {
  selectAllTeamInvitesSent,
  selectTeamInviteSentByClientId,
  selectTeamInviteSentByServerId,
  useTeamInvitesSentStore,
} from '@/features/team/invitations/store/teamInvitesSentStore'
import {
  selectAllTeamInvitesReceived,
  selectTeamInviteReceivedByClientId,
  selectTeamInviteReceivedByServerId,
  useTeamInvitesReceivedStore,
} from '@/features/team/invitations/store/teamInvitesReceivedStore'

export const useTeamInvitesSent = () =>
  useTeamInvitesSentStore(useShallow(selectAllTeamInvitesSent))

export const useTeamInviteSentByClientId = (clientId: string | null | undefined) =>
  useTeamInvitesSentStore(selectTeamInviteSentByClientId(clientId))

export const useTeamInviteSentByServerId = (id: number | null | undefined) =>
  useTeamInvitesSentStore(selectTeamInviteSentByServerId(id))

export const useTeamInvitesReceived = () =>
  useTeamInvitesReceivedStore(useShallow(selectAllTeamInvitesReceived))

export const useTeamInviteReceivedByClientId = (clientId: string | null | undefined) =>
  useTeamInvitesReceivedStore(selectTeamInviteReceivedByClientId(clientId))

export const useTeamInviteReceivedByServerId = (id: number | null | undefined) =>
  useTeamInvitesReceivedStore(selectTeamInviteReceivedByServerId(id))
