import type { EntityTable } from "@shared-store"
import type { TeamInviteSent } from '@/features/team/invitations/types/teamInvitation'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useTeamInvitesSentStore = createEntityStore<TeamInviteSent>()

export const selectAllTeamInvitesSent = (state: EntityTable<TeamInviteSent>) =>
  selectAll<TeamInviteSent>()(state)

export const selectTeamInviteSentByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<TeamInviteSent>) =>
    selectByClientId<TeamInviteSent>(clientId)(state)

export const selectTeamInviteSentByServerId = (id: number | null | undefined) =>
  (state: EntityTable<TeamInviteSent>) =>
    selectByServerId<TeamInviteSent>(id)(state)

export const insertTeamInviteSent = (invite: TeamInviteSent) =>
  useTeamInvitesSentStore.getState().insert(invite)

export const insertTeamInvitesSent = (table: { byClientId: Record<string, TeamInviteSent>; allIds: string[] }) =>
  useTeamInvitesSentStore.getState().insertMany(table)

export const upsertTeamInviteSent = (invite: TeamInviteSent) => {
  const state = useTeamInvitesSentStore.getState()
  if (state.byClientId[invite.client_id]) {
    state.update(invite.client_id, (existing) => ({ ...existing, ...invite }))
    return
  }
  state.insert(invite)
}

export const upsertTeamInvitesSent = (table: { byClientId: Record<string, TeamInviteSent>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const invite = table.byClientId[clientId]
    if (invite) {
      upsertTeamInviteSent(invite)
    }
  })
}

export const updateTeamInviteSent = (clientId: string, updater: (invite: TeamInviteSent) => TeamInviteSent) =>
  useTeamInvitesSentStore.getState().update(clientId, updater)

export const removeTeamInviteSent = (clientId: string) =>
  useTeamInvitesSentStore.getState().remove(clientId)

export const clearTeamInvitesSent = () =>
  useTeamInvitesSentStore.getState().clear()
