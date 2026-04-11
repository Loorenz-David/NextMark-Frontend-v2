import type { EntityTable } from "@shared-store"
import type { UserRole } from '@/features/role/userRole/types/userRole'

import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

export const useUserRoleStore = createEntityStore<UserRole>()

export const selectAllUserRoles = (state: EntityTable<UserRole>) => selectAll<UserRole>()(state)

export const selectUserRoleByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<UserRole>) =>
    selectByClientId<UserRole>(clientId)(state)

export const selectUserRoleByServerId = (id: number | null | undefined) =>
  (state: EntityTable<UserRole>) =>
    selectByServerId<UserRole>(id)(state)

export const insertUserRole = (role: UserRole) =>
  useUserRoleStore.getState().insert(role)

export const insertUserRoles = (table: { byClientId: Record<string, UserRole>; allIds: string[] }) =>
  useUserRoleStore.getState().insertMany(table)

export const upsertUserRole = (role: UserRole) => {
  const state = useUserRoleStore.getState()
  if (state.byClientId[role.client_id]) {
    state.update(role.client_id, (existing) => ({ ...existing, ...role }))
    return
  }
  state.insert(role)
}

export const upsertUserRoles = (table: { byClientId: Record<string, UserRole>; allIds: string[] }) => {
  table.allIds.forEach((clientId) => {
    const role = table.byClientId[clientId]
    if (role) {
      upsertUserRole(role)
    }
  })
}

export const updateUserRole = (clientId: string, updater: (role: UserRole) => UserRole) =>
  useUserRoleStore.getState().update(clientId, updater)

export const removeUserRole = (clientId: string) =>
  useUserRoleStore.getState().remove(clientId)

export const clearUserRoles = () =>
  useUserRoleStore.getState().clear()
