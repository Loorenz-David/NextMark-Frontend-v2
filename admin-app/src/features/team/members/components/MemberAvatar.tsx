import { cn } from '@/lib/utils/cn'

type MemberAvatarProps = {
  username: string
  className?: string
}

const getInitials = (username: string) => username.trim().slice(0, 2).toUpperCase()

export const MemberAvatar = ({ username, className }: MemberAvatarProps) => {
  const initials = getInitials(username)

  return (
    <div
      className={cn(
        'flex p-2 items-center justify-center rounded-full bg-[var(--color-light-blue)]/20 text-sm font-semibold text-[var(--color-muted)] ',
        className,
      )}
      aria-label={`${username} avatar`}
      title={username}
    >
      {initials}
    </div>
  )
}
