type UserCardProps = {
  email: string | null
  name: string
}

export function UserCard({
  email,
  name,
}: UserCardProps) {
  const initials = getInitials(name)

  return (
    <div className="flex w-full items-center gap-4 py-4 text-left text-white">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[rgb(var(--bg-app-color))]">
        {initials}
      </span>

      <span className="grid min-w-0 flex-1 grid-cols-1 gap-1">
        <span className="truncate text-sm font-semibold text-white">{name}</span>
        <span className="truncate text-xs text-white/60">{email ?? 'No email available'}</span>
      </span>
    </div>
  )
}

function getInitials(name: string) {
  const normalized = name.trim()
  if (!normalized) {
    return '?'
  }

  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
