import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import type { TeamMember, TeamMemberMap } from '@/features/team/members/types/teamMember'

export const useTeamMemberModel = () => ({
  normalizeTeamMember: (payload: TeamMemberMap | TeamMember | null | undefined) =>
    normalizeEntityMap<TeamMember>(payload ?? null),
})
