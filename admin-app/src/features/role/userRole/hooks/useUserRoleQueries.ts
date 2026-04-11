import { useCallback } from 'react'

import { normalizeEntityMap } from '@/lib/utils/entities/normalizeEntityMap'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { userRoleApi } from '@/features/role/userRole/api/userRoleApi'
import type { UserRole, UserRoleMap } from '@/features/role/userRole/types/userRole'
import type { UserRoleQueryFilters } from '@/features/role/userRole/types/userRoleMeta'
import { insertUserRoles, upsertUserRole } from '@/features/role/userRole/store/userRoleStore'
import {
  setUserRoleListError,
  setUserRoleListLoading,
  setUserRoleListResult,
} from '@/features/role/userRole/store/userRoleListStore'

const buildQueryKey = (query?: UserRoleQueryFilters) => JSON.stringify(query ?? {})

export function useUserRoleQueries() {
  const { showMessage } = useMessageHandler()

  const fetchUserRoles = useCallback(
    async (query?: UserRoleQueryFilters) => {
      const queryKey = buildQueryKey(query)
      setUserRoleListLoading(true)
      try {
        const response = await userRoleApi.listUserRoles(query)
        const payload = response.data

        if (!payload?.user_roles) {
          console.warn('User roles response missing user_roles', payload)
          setUserRoleListError('Missing user roles response.')
          return null
        }

        insertUserRoles(payload.user_roles)
        setUserRoleListResult({
          queryKey,
          query,
          pagination: payload.user_roles_pagination,
        })

        return payload
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load user roles.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch user roles', error)
        setUserRoleListError(message)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  const fetchUserRoleById = useCallback(
    async (roleId: number | string) => {
      try {
        const response = await userRoleApi.getUserRole(roleId)
        const payload = response.data

        const normalized = normalizeEntityMap<UserRole>(payload?.user_role as UserRoleMap | UserRole)
        if (!normalized) {
          console.warn('User role response missing user_role', payload)
          return null
        }

        normalized.allIds.forEach((clientId) => {
          const role = normalized.byClientId[clientId]
          if (role) {
            upsertUserRole(role)
          }
        })

        return normalized
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to load user role.'
        const status = error instanceof ApiError ? error.status : 500
        console.error('Failed to fetch user role', error)
        showMessage({ status, message })
        return null
      }
    },
    [showMessage],
  )

  return {
    fetchUserRoles,
    fetchUserRoleById,
  }
}
