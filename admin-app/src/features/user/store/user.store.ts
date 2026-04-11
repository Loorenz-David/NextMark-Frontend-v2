import { useShallow } from 'zustand/react/shallow'
import { createEntityStore } from "@shared-store"
import type { EntityTable } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { User, UserMap } from '../types/user'

export const useUserStore = createEntityStore<User>()

export const useUsers = () => useUserStore( useShallow(selectAll<User>()) )

export const useUserByClientId = (clientId: string | null | undefined) =>
  useUserStore(selectByClientId<User>(clientId))

export const useUserByServerId = (id: number | null | undefined) =>
  useUserStore(selectByServerId<User>(id))

export const useCurrentUser = () => {
  const users = useUsers()
  return users[0] ?? null
}

export const insertUser = (user: User) => useUserStore.getState().insert(user)

export const insertUsers = (map: UserMap) =>
  useUserStore.getState().insertMany(map)

export const updateUserByClientId = (
  clientId: string,
  updater: (user: User) => User,
) => useUserStore.getState().update(clientId, updater)

export const clearUsers = () => useUserStore.getState().clear()

export type UserStoreState = EntityTable<User>
