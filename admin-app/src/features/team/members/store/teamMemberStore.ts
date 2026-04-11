import type { EntityTable } from "@shared-store"
import type { TeamMember } from '../types/teamMember'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useTeamMemberStore = createEntityStore<TeamMember>()

export const selectAllTeamMembers = (state: EntityTable<TeamMember>) => selectAll<TeamMember>()(state)

export const selectTeamMemberByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<TeamMember>) =>
    selectByClientId<TeamMember>(clientId)(state)

export const selectTeamMemberByServerId = (id: number | null | undefined) =>
  (state: EntityTable<TeamMember>) =>
    selectByServerId<TeamMember>(id)(state)

export const insertTeamMember = (member: TeamMember) =>
  useTeamMemberStore.getState().insert(member)

export const insertTeamMembers = (table: { byClientId: Record<string, TeamMember>; allIds: string[] }) =>
  useTeamMemberStore.getState().insertMany(table)

export const upsertTeamMember = (member: TeamMember) => {
  const state = useTeamMemberStore.getState()
  if (state.byClientId[member.client_id]) {
    state.update(member.client_id, (existing) => ({ ...existing, ...member }))
    return
  }
  state.insert(member)
}

export const upsertTeamMembers = (table: { byClientId: Record<string, TeamMember>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const member = table.byClientId[clientId]
    if (member) {
      upsertTeamMember(member)
    }
  })
}

export const updateTeamMember = (clientId: string, updater: (member: TeamMember) => TeamMember) =>
  useTeamMemberStore.getState().update(clientId, updater)

export const removeTeamMember = (clientId: string) =>
  useTeamMemberStore.getState().remove(clientId)

export const clearTeamMembers = () =>
  useTeamMemberStore.getState().clear()
