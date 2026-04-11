import type { CaseChat } from '../domain'

type OrderCaseChatThreadProps = {
  chats: CaseChat[]
  currentUserId?: number | null
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

function formatRelative(value: string) {
  const parsed = new Date(value)
  const parsedMs = parsed.getTime()
  if (Number.isNaN(parsedMs)) {
    return value
  }

  const diffSeconds = Math.round((parsedMs - Date.now()) / 1000)
  if (Math.abs(diffSeconds) < 60) {
    return relativeTimeFormatter.format(0, 'second')
  }

  const unitConfig = RELATIVE_UNITS.find((entry) => Math.abs(diffSeconds) >= entry.seconds)
  if (!unitConfig) {
    return relativeTimeFormatter.format(0, 'second')
  }

  return relativeTimeFormatter.format(Math.round(diffSeconds / unitConfig.seconds), unitConfig.unit)
}

function resolveDisplayName(chat: CaseChat, isMine: boolean) {
  if (isMine) {
    return 'You'
  }

  if (typeof chat.user_name === 'string' && chat.user_name.trim()) {
    return chat.user_name.trim()
  }

  return 'Unknown user'
}

function resolveInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export function OrderCaseChatThread({ chats, currentUserId }: OrderCaseChatThreadProps) {
  if (chats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/55">
        No messages yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => {
        const isMine = currentUserId != null && chat.user_id === currentUserId
        const displayName = resolveDisplayName(chat, isMine)
        const initials = resolveInitials(displayName)
        const creationDate = formatRelative(chat.creation_date)
        return (
          <div
            key={chat.client_id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`flex w-full items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-semibold text-white/90"
                  title={displayName}
                >
                  {initials}
                </div>

                <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${isMine ? 'bg-cyan-400/15 text-white' : 'bg-white/8 text-white/90'}`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{chat.message}</p>
                </div>
              </div>

              <div className={`mt-1 flex w-full gap-2 text-[11px] text-white/45 ${isMine ? 'justify-end pr-9' : 'justify-start pl-9'}`}>
                <span>{creationDate}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
