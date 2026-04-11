import {
  selectAllUserRoles,
  selectUserRoleByClientId,
  selectUserRoleByServerId,
  useUserRoleStore,
} from '@/features/role/userRole/store/userRoleStore'

export const useUserRoles = () => useUserRoleStore(selectAllUserRoles)

export const useUserRoleByClientId = (clientId: string | null | undefined) =>
  useUserRoleStore(selectUserRoleByClientId(clientId))

export const useUserRoleByServerId = (id: number | null | undefined) =>
  useUserRoleStore(selectUserRoleByServerId(id))
