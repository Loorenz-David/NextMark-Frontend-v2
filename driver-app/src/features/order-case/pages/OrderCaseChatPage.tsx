import { useEffect, useRef, useState } from 'react'

import { OrderCaseChatComposer, OrderCaseChatHeader, OrderCaseChatThread } from '../components'
import { useOrderCaseChatPageController } from '../controllers'

const BOTTOM_STICKY_THRESHOLD_PX = 48

export function OrderCaseChatPage() {
  const {
    orderCaseId,
    onBack,
    onClose,
    onSelectState,
    orderCase,
    chats,
    currentUserId,
    draft,
    isLoading,
    isSending,
    isUpdatingState,
    loadError,
    sendError,
    stateError,
    setDraft,
    sendMessage,
  } = useOrderCaseChatPageController()

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const previousChatCountRef = useRef(0)
  const [showNewMessagesPill, setShowNewMessagesPill] = useState(false)

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
  }

  useEffect(() => {
    shouldStickToBottomRef.current = true
    setShowNewMessagesPill(false)
    previousChatCountRef.current = 0

    const frame = requestAnimationFrame(() => {
      scrollToBottom('auto')
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [orderCaseId])

  useEffect(() => {
    const hasNewMessage = chats.length > previousChatCountRef.current
    previousChatCountRef.current = chats.length

    if (shouldStickToBottomRef.current) {
      const frame = requestAnimationFrame(() => {
        scrollToBottom('auto')
        setShowNewMessagesPill(false)
      })

      return () => {
        cancelAnimationFrame(frame)
      }
    }

    if (hasNewMessage) {
      const latestChat = chats[chats.length - 1]
      const isFromCurrentUser = currentUserId != null && latestChat?.user_id === currentUserId
      if (!isFromCurrentUser) {
        setShowNewMessagesPill(true)
      }
    }
  }, [chats, currentUserId, isLoading])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const remaining = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldStickToBottomRef.current = remaining <= BOTTOM_STICKY_THRESHOLD_PX
    if (shouldStickToBottomRef.current) {
      setShowNewMessagesPill(false)
    }
  }

  const handleJumpToLatest = () => {
    shouldStickToBottomRef.current = true
    setShowNewMessagesPill(false)
    scrollToBottom('smooth')
  }

  return (
    <section className="relative z-10 [grid-area:overlay] flex h-full min-h-0 w-full flex-col bg-[rgb(var(--bg-app-color))] text-white">
      <OrderCaseChatHeader
        onBack={onBack}
        onClose={onClose}
        onSelectState={onSelectState}
        state={orderCase?.state ?? 'Open'}
        title={orderCase?.label ?? `Case #${orderCase?.id ?? orderCaseId}`}
        isUpdatingState={isUpdatingState}
      />
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        data-bottom-sheet-scroll-root
        onScroll={handleScroll}
      >
        {stateError ? (
          <p className="mb-4 text-sm text-red-200">{stateError}</p>
        ) : null}
        {isLoading ? (
          <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-5 text-sm text-white/60">
            Loading conversation...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-5 text-sm text-red-100">
            {loadError}
          </div>
        ) : (
          <OrderCaseChatThread
            chats={chats}
            currentUserId={currentUserId}
          />
        )}

        {sendError ? (
          <p className="mt-4 text-sm text-red-200">{sendError}</p>
        ) : null}
      </div>

      <div className="flex justify-center px-5 pb-3">
        {showNewMessagesPill ? (
          <button
            className="mb-2 flex w-max flex-col items-center rounded-full border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
            onClick={handleJumpToLatest}
            type="button"
          >
            <span>New messages</span>
            <span className="text-lg font-bold leading-none">↓</span>
          </button>
        ) : null}
      </div>

      <OrderCaseChatComposer
        isSending={isSending}
        onChange={setDraft}
        onSend={sendMessage}
        value={draft}
      />
    </section>
  )
}
