import { cn } from '@/lib/utils/cn'
import type { SessionUser } from '@/features/auth/login/store/sessionStorage'
import { resolveUserLabel } from '../domain/resolveUserLabel'

const getInitials = (label: string) => label.trim().slice(0, 2).toUpperCase()

type ActingUserAvatarProps = {
  user: SessionUser
  className?: string
}

export const ActingUserAvatar = ({ user, className }: ActingUserAvatarProps) => {
  const label = resolveUserLabel(user)
  const picture =
    typeof user.profile_picture === 'string' && user.profile_picture.trim()
      ? user.profile_picture
      : null

  if (picture) {
    return (
      <img
        src={picture}
        alt={`${label} avatar`}
        className={cn('h-9 w-9 shrink-0 rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-light-blue)]/20 text-sm font-semibold text-[var(--color-muted)]',
        className,
      )}
      aria-label={`${label} avatar`}
      title={label}
    >
      {getInitials(label)}
    </div>
  )
}
