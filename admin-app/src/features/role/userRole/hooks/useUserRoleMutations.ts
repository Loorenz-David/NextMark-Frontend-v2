import { useCallback } from 'react'

import { buildClientId } from '@/lib/utils/clientId'
import { ApiError } from '@/lib/api/ApiClient'
import { useMessageHandler } from '@shared-message-handler'

import { userRoleApi } from '@/features/role/userRole/api/userRoleApi'
import type { UserRole, UserRoleFields, UserRoleUpdateFields } from '@/features/role/userRole/types/userRole'
import {
  insertUserRole,
  removeUserRole,
  selectUserRoleByClientId,
  selectUserRoleByServerId,
  updateUserRole,
  useUserRoleStore,
} from '@/features/role/userRole/store/userRoleStore'

const resolveError = (error: unknown, fallback: string) => ({
  message: error instanceof ApiError ? error.message : fallback,
  status: error instanceof ApiError ? error.status : 500,
})

export function useUserRoleMutations() {
  const { showMessage } = useMessageHandler()

  const createUserRole = useCallback(
    async (payload: UserRoleFields) => {
      const clientId = payload.client_id || buildClientId('user_role')

      const optimisticRole: UserRole = {
        client_id: clientId,
        role_name: payload.role_name,
        description: payload.description ?? null,
        is_system: payload.is_system,
        base_role_id: payload.base_role_id,
      }

      insertUserRole(optimisticRole)

      try {
        const response = await userRoleApi.createUserRole({
          ...payload,
          client_id: clientId,
        })

        const roleId = response.data?.user_role?.[clientId]
        if (typeof roleId === 'number') {
          updateUserRole(clientId, (role) => ({
            ...role,
            id: roleId,
          }))
        }

        return response.data
      } catch (error) {
        const resolved = resolveError(error, 'Unable to create user role.')
        console.error('Failed to create user role', error)
        removeUserRole(clientId)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const updateUserRoleInstance = useCallback(
    async (clientId: string, fields: UserRoleUpdateFields) => {
      const existing = selectUserRoleByClientId(clientId)(useUserRoleStore.getState())
      if (!existing) {
        showMessage({ status: 404, message: 'User role not found for update.' })
        return null
      }
      if (!existing.id) {
        showMessage({ status: 400, message: 'User role must be synced before update.' })
        return null
      }

      const previous = { ...existing }
      updateUserRole(clientId, (role) => ({
        ...role,
        ...(fields as Partial<UserRole>),
      }))

      try {
        await userRoleApi.updateUserRole({
          target_id: existing.id,
          fields,
        })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to update user role.')
        console.error('Failed to update user role', error)
        updateUserRole(clientId, () => previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  const deleteUserRoleInstance = useCallback(
    async (idOrClientId: number | string) => {
      const role = typeof idOrClientId === 'number'
        ? selectUserRoleByServerId(idOrClientId)(useUserRoleStore.getState())
        : selectUserRoleByClientId(idOrClientId)(useUserRoleStore.getState())

      if (!role) {
        showMessage({ status: 404, message: 'User role not found for deletion.' })
        return null
      }

      if (!role.id) {
        showMessage({ status: 400, message: 'User role must be synced before deletion.' })
        return null
      }

      const previous = { ...role }
      removeUserRole(role.client_id)

      try {
        await userRoleApi.deleteUserRole({ target_id: role.id })
        return true
      } catch (error) {
        const resolved = resolveError(error, 'Unable to delete user role.')
        console.error('Failed to delete user role', error)
        insertUserRole(previous)
        showMessage({ status: resolved.status, message: resolved.message })
        return null
      }
    },
    [showMessage],
  )

  return {
    createUserRole,
    updateUserRole: updateUserRoleInstance,
    deleteUserRole: deleteUserRoleInstance,
  }
}
