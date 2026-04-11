import type { EntityTable } from "@shared-store"
import type { TeamInviteReceived } from '@/features/team/invitations/types/teamInvitation'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useTeamInvitesReceivedStore = createEntityStore<TeamInviteReceived>()

export const selectAllTeamInvitesReceived = (state: EntityTable<TeamInviteReceived>) =>
  selectAll<TeamInviteReceived>()(state)

export const selectTeamInviteReceivedByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<TeamInviteReceived>) =>
    selectByClientId<TeamInviteReceived>(clientId)(state)

export const selectTeamInviteReceivedByServerId = (id: number | null | undefined) =>
  (state: EntityTable<TeamInviteReceived>) =>
    selectByServerId<TeamInviteReceived>(id)(state)

export const insertTeamInviteReceived = (invite: TeamInviteReceived) =>
  useTeamInvitesReceivedStore.getState().insert(invite)

export const insertTeamInvitesReceived = (
  table: { byClientId: Record<string, TeamInviteReceived>; allIds: string[] },
) => useTeamInvitesReceivedStore.getState().insertMany(table)

export const upsertTeamInviteReceived = (invite: TeamInviteReceived) => {
  const state = useTeamInvitesReceivedStore.getState()
  if (state.byClientId[invite.client_id]) {
    state.update(invite.client_id, (existing) => ({ ...existing, ...invite }))
    return
  }
  state.insert(invite)
}

export const upsertTeamInvitesReceived = (
  table: { byClientId: Record<string, TeamInviteReceived>; allIds: string[] },
) => {
  table.allIds.forEach((clientId) => {
    const invite = table.byClientId[clientId]
    if (invite) {
      upsertTeamInviteReceived(invite)
    }
  })
}

export const updateTeamInviteReceived = (
  clientId: string,
  updater: (invite: TeamInviteReceived) => TeamInviteReceived,
) => useTeamInvitesReceivedStore.getState().update(clientId, updater)

export const removeTeamInviteReceived = (clientId: string) =>
  useTeamInvitesReceivedStore.getState().remove(clientId)

export const clearTeamInvitesReceived = () =>
  useTeamInvitesReceivedStore.getState().clear()
