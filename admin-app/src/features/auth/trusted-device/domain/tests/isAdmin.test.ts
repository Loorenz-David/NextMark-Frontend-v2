import type { SessionUser } from '@/features/auth/login/store/sessionStorage'
import { isAdminUser } from '../isAdmin'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runIsAdminTests = () => {
  assert(isAdminUser({ base_role_id: 1 } as SessionUser), 'base_role_id 1 is admin')
  assert(!isAdminUser({ base_role_id: 2 } as SessionUser), 'other roles are not admin')
  assert(!isAdminUser({} as SessionUser), 'missing base_role_id is not admin')
  assert(!isAdminUser(null), 'null user is not admin')
  assert(!isAdminUser(undefined), 'undefined user is not admin')
}
