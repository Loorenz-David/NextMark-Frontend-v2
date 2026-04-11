import { useCallback } from 'react'

import { useGetUser } from '../api/user.api'
import { useUserModel } from '../domain/useUserModel'
import { insertUsers } from '../store/user.store'

export const useUserFlow = () => {
  const getUser = useGetUser()
  const { normalizeUserResponse } = useUserModel()

  const loadProfile = useCallback(async () => {
    const response = await getUser()
    const normalized = normalizeUserResponse(response.data)
    insertUsers(normalized)
    return normalized
  }, [getUser, normalizeUserResponse])

  return { loadProfile }
}
