import { useMemo } from 'react'

import { useTeamMembers } from './useTeamMemberSelectors'

export const useTeamMemberStoreQuery = (query: string) => {
  const teamMembers = useTeamMembers()

  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return teamMembers
    }
    return teamMembers.filter((member) =>
      member.username.toLowerCase().includes(normalizedQuery),
    )
  }, [teamMembers, query])
}
