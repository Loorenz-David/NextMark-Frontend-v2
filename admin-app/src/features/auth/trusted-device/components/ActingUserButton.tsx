import { usePopupManager } from '@/shared/resource-manager/useResourceManager'
import {
  useActiveAuthUser,
  useAuthenticationMode,
  useCanSwitchAuthUser,
} from '@/features/auth/login/hooks/useAuthSelectors'

import { ActingUserAvatar } from './ActingUserAvatar'
import { resolveUserLabel } from '../domain/resolveUserLabel'

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="m7 10 5 5 5-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

/**
 * Global header action showing the acting user. Renders only in trusted-device
 * mode: a clickable account switcher when more than one user is available, or a
 * static indicator for a single trusted-device user. Single-user mode renders
 * nothing so the existing header is preserved.
 *
 * The header only reads the active user and whether switching is available, and
 * invokes the popup — the user-selection list lives in the popup, not here.
 */
export const ActingUserButton = () => {
  const mode = useAuthenticationMode()
  const user = useActiveAuthUser()
  const canSwitch = useCanSwitchAuthUser()
  const popupManager = usePopupManager()

  if (mode !== 'trusted_device' || !user) {
    return null
  }

  const label = resolveUserLabel(user)

  if (!canSwitch) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-[var(--color-muted)]/24 px-3 py-[5px]"
        aria-label={`Signed in as ${label}`}
      >
        <ActingUserAvatar user={user} className="h-6 w-6 text-xs" />
        <span className="max-w-[10rem] truncate text-sm text-[var(--color-text)]">
          {label}
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => popupManager.open({ key: 'switchActingUser' })}
      aria-label={`Switch account (currently ${label})`}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-muted)]/24 px-3 py-[5px] transition-colors hover:border-[var(--color-muted)]/40"
    >
      <ActingUserAvatar user={user} className="h-6 w-6 text-xs" />
      <span className="max-w-[10rem] truncate text-sm text-[var(--color-text)]">
        {label}
      </span>
      <ChevronIcon className="h-4 w-4 text-[var(--color-muted)]" />
    </button>
  )
}
