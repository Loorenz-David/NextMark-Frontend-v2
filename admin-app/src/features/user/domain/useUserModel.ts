import type { User, UserMap, UserResponse } from '../types/user'

export const useUserModel = () => {
  const normalizeUserResponse = (response: UserResponse): UserMap => {
    const payload = response.user
    if (isUserMap(payload)) {
      return payload
    }
    return {
      byClientId: { [payload.client_id]: payload },
      allIds: [payload.client_id],
    }
  }

  return { normalizeUserResponse }
}

const isUserMap = (value: User | UserMap): value is UserMap =>
  Boolean((value as UserMap).byClientId && (value as UserMap).allIds)
