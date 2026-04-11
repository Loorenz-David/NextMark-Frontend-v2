import { useShallow } from 'zustand/react/shallow'
import {
  selectAllTeamMembers,
  selectTeamMemberByClientId,
  selectTeamMemberByServerId,
  useTeamMemberStore,
} from '../store/teamMemberStore'

export const useTeamMembers = () => useTeamMemberStore( useShallow(selectAllTeamMembers) ) 

export const useTeamMemberByClientId = (clientId: string | null | undefined) =>
  useTeamMemberStore(selectTeamMemberByClientId(clientId))

export const useTeamMemberByServerId = (id: number | null | undefined) =>
  useTeamMemberStore(selectTeamMemberByServerId(id))
