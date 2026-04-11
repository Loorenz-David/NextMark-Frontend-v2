import { useEffect, useState } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import { sessionStorage, type SessionSnapshot } from '@/features/auth/login/store/sessionStorage'

const resolveTeamName = (session: SessionSnapshot | null) => {
  const value = session?.user?.team_name
  return typeof value === 'string' ? value : null
}

export const useTeamMemberMeta = () => {
  const [teamName, setTeamName] = useState(() => {
    const user = apiClient.getSessionUser()
    const value = user?.team_name
    return typeof value === 'string' ? value : null
  })

  useEffect(() => {
    const unsubscribe = sessionStorage.subscribe((session) => {
      setTeamName(resolveTeamName(session))
    })

    return unsubscribe
  }, [])

  return { teamName }
}
