import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import type { CaseChat } from '../types'

type OrderCaseChatListProps = {
  chats: CaseChat[]
  currentUserId?: number | null
}

const resolveDisplayName = (chat: CaseChat, isMine: boolean) => {
  if (isMine) {
    return 'You'
  }

  if (typeof chat.user_name === 'string' && chat.user_name.trim()) {
    return chat.user_name.trim()
  }

  return 'Unknown user'
}

const resolveInitials = (name: string) => {
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

export const OrderCaseChatList = ({ chats, currentUserId }: OrderCaseChatListProps) => {
  if (!chats.length) {
    return (
      <div className="admin-glass-panel rounded-[24px] border border-dashed border-white/10 px-4 py-5 text-sm text-[var(--color-muted)]" style={{ boxShadow: 'none' }}>
        No messages yet.
      </div>
    )
  }

  const sortedChats = [...chats].sort((a, b) =>
    new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime(),
  )

  return (
    <div className="flex flex-col gap-3 pt-2">
      {sortedChats.map((chat) => {
        const isMine = currentUserId != null && chat.user_id === currentUserId
        const creationDate = formatIsoDateRelative(chat.creation_date)
        const displayName = resolveDisplayName(chat, isMine)
        const initials = resolveInitials(displayName)

        return (
          <div
            key={chat.client_id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`flex w-full items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-semibold text-[var(--color-text)]"
                  title={displayName}
                >
                  {initials}
                </div>

                <div className={`max-w-[82%] rounded-[20px] border px-3.5 py-2.5 backdrop-blur-xl ${
                  isMine
                    ? 'border-[rgba(104,214,195,0.22)] bg-[linear-gradient(135deg,rgba(72,180,194,0.16),rgba(111,224,207,0.08))]'
                    : 'border-white/10 bg-white/[0.04]'
                }`}>
                  {!isMine ? (
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {displayName}
                    </p>
                  ) : null}
                  <p className="text-sm break-words whitespace-pre-wrap leading-6 text-[var(--color-text)]">
                    {chat.message}
                  </p>
                </div>
              </div>

              <div className={`mt-1 flex w-full gap-2 text-[10px] text-[var(--color-muted)] ${isMine ? 'justify-end pr-10' : 'justify-start pl-10'}`}>
                <span className="text-[9px]">{creationDate ?? chat.creation_date}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
