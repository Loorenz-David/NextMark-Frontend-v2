import type { SessionUser } from '@/features/auth/login/store/sessionStorage'
import { useActiveAuthUser } from '@/features/auth/login/hooks/useAuthSelectors'

/** Backend ADMIN role id (see role_decorator.ADMIN = 1). */
const ADMIN_BASE_ROLE_ID = 1

/**
 * UX-only admin check. Trusted-device management is enforced server-side via
 * `@role_required([ADMIN])`; this gates the UI so non-admins don't see enabled
 * actions that would only 403.
 */
export const isAdminUser = (user: SessionUser | null | undefined): boolean =>
  user?.base_role_id === ADMIN_BASE_ROLE_ID

export const useIsTrustedDeviceAdmin = (): boolean => isAdminUser(useActiveAuthUser())
