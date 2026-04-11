import type { TeamMember } from '@/features/team/members/types/teamMember'

import type { TeamMemberFilterKey } from '../types/teamMemberFilters'

const toSearchValue = (value: string) => value.trim().toLowerCase()

const buildMemberFields = (member: TeamMember) => ({
  username: member.username ?? '',
  email: member.email ?? '',
  phone_number: member.phone_number
    ? typeof member.phone_number === 'string'
      ? member.phone_number
      : JSON.stringify(member.phone_number)
    : '',
})

export const filterTeamMembers = (
  members: TeamMember[],
  input: string | null,
  filters: TeamMemberFilterKey[],
) => {
  const query = input ? toSearchValue(input) : ''
  if (!query) {
    return members
  }

  const activeFilters = filters.length
    ? filters
    : (['username', 'email', 'phone_number'] as TeamMemberFilterKey[])

  return members.filter((member) => {
    const fields = buildMemberFields(member)
    return activeFilters.some((key) => toSearchValue(fields[key]).includes(query))
  })
}
