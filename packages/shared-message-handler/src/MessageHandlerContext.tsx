import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { MessageStack } from './components/MessageStack'

export type MessageStatus = 'success' | 'warning' | 'error' | 'info'
export type MessageStatusInput = MessageStatus | number

export interface MessagePayload {
  status: MessageStatusInput
  message: string
  details?: string
  messageDuration?: number
}

export interface ManagedMessage extends Omit<MessagePayload, 'status'> {
  id: string
  createdAt: number
  status: MessageStatus
  durationMs: number
}

interface MessageHandlerContextValue {
  showMessage: (payload: MessagePayload) => void
}

const MessageHandlerContext = createContext<MessageHandlerContextValue | undefined>(undefined)

const DEFAULT_MAX_MESSAGES = 2
const DEFAULT_MESSAGE_DURATION_MS = 8000

interface MessageHandlerProviderProps {
  children: ReactNode
  maxMessages?: number
  defaultMessageDurationMs?: number
}

export function MessageHandlerProvider({
  children,
  maxMessages = DEFAULT_MAX_MESSAGES,
  defaultMessageDurationMs = DEFAULT_MESSAGE_DURATION_MS,
}: MessageHandlerProviderProps) {
  const [messages, setMessages] = useState<ManagedMessage[]>([])
  const timeoutsRef = useRef<Map<string, number>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const removeMessage = useCallback(
    (id: string) => {
      clearTimer(id)
      setMessages((prev: ManagedMessage[]) => prev.filter((message: ManagedMessage) => message.id !== id))
    },
    [clearTimer],
  )

  const showMessage = useCallback(
    ({ status, message, details, messageDuration }: MessagePayload) => {
      const normalizedStatus = resolveMessageStatus(status)
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      const durationMs = messageDuration ?? defaultMessageDurationMs
      const entry: ManagedMessage = {
        id,
        status: normalizedStatus,
        message,
        details,
        createdAt: Date.now(),
        durationMs,
      }

      setMessages((prev: ManagedMessage[]) => {
        const next = [...prev, entry]
        if (next.length <= maxMessages) {
          return next
        }

        const overflowCount = next.length - maxMessages
        const removed = next.slice(0, overflowCount)
        removed.forEach((nextMessage) => clearTimer(nextMessage.id))
        return next.slice(overflowCount)
      })

      const timeoutId = window.setTimeout(() => removeMessage(id), durationMs)
      timeoutsRef.current.set(id, timeoutId)
    },
    [clearTimer, defaultMessageDurationMs, maxMessages, removeMessage],
  )

  const contextValue = useMemo(() => ({ showMessage }), [showMessage])

  return (
    <MessageHandlerContext.Provider value={contextValue}>
      {children}
      <MessageStack messages={messages} onDismiss={removeMessage} />
    </MessageHandlerContext.Provider>
  )
}

export function useMessageHandler() {
  const context = useContext(MessageHandlerContext)
  if (!context) {
    throw new Error('useMessageHandler must be used within a MessageHandlerProvider')
  }
  return context
}

function resolveMessageStatus(status: MessageStatusInput): MessageStatus {
  if (typeof status === 'number') {
    if (status >= 200 && status < 300) {
      return 'success'
    }
    if (status >= 400 && status < 500) {
      return 'warning'
    }
    if (status >= 500) {
      return 'error'
    }
    return 'info'
  }
  return status
}
