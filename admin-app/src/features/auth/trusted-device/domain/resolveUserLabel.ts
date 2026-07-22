import type { SessionUser } from '@/features/auth/login/store/sessionStorage'

/** Human-readable display name for a stored user, preferring username. */
export const resolveUserLabel = (user: SessionUser): string => {
  if (typeof user.username === 'string' && user.username.trim()) {
    return user.username
  }
  if (typeof user.email === 'string' && user.email.trim()) {
    return user.email
  }
  return 'User'
}
