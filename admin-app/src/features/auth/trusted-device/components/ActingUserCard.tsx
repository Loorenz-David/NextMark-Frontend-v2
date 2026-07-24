import type { SessionUser } from '@/features/auth/login/store/sessionStorage'
import { ActingUserAvatar } from './ActingUserAvatar'
import { resolveUserLabel } from '../domain/resolveUserLabel'

const CheckMarkIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" className={className}>
    <path
      d="M5 12.5 9.5 17 19 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
    />
  </svg>
)

const resolveSecondary = (user: SessionUser): string | null => {
  const label = resolveUserLabel(user)
  if (typeof user.email === 'string' && user.email.trim() && user.email !== label) {
    return user.email
  }
  if (typeof user.team_name === 'string' && user.team_name.trim()) {
    return user.team_name
  }
  return null
}

const resolveRole = (user: SessionUser): string | null =>
  typeof user.base_role === 'string' && user.base_role.trim() ? user.base_role : null

type ActingUserCardProps = {
  user: SessionUser
  isActive: boolean
  onSelect: () => void
}

export const ActingUserCard = ({ user, isActive, onSelect }: ActingUserCardProps) => {
  const name = resolveUserLabel(user)
  const secondary = resolveSecondary(user)
  const role = resolveRole(user)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        isActive
          ? 'border-info-border bg-[linear-gradient(135deg,rgba(56,189,248,0.15),rgba(56,189,248,0.05))] text-[var(--color-text)]'
          : 'border-border bg-[var(--color-page)] text-muted hover:border-border-accent'
      }`}
    >
      <ActingUserAvatar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium leading-5 text-[var(--color-text)]">
          {name}
        </span>
        {secondary ? (
          <span className="truncate text-xs leading-4 text-[var(--color-muted)]">
            {secondary}
          </span>
        ) : null}
        {role ? (
          <span className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-[var(--color-muted)]/80">
            {role}
          </span>
        ) : null}
      </div>
      {isActive ? (
        <span className="flex h-5 items-center rounded-full bg-[rgba(96,165,250,0.18)] px-2 text-[11px] font-semibold text-[rgba(147,197,253,0.95)]">
          Active
        </span>
      ) : (
        <CheckMarkIcon className="h-4 w-4 shrink-0 text-transparent" />
      )}
    </button>
  )
}
