import { useEffect, useRef, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'

import { OrderCaseChatComposer } from '../../components/OrderCaseChatComposer'
import { OrderCaseChatList } from '../../components/OrderCaseChatList'
import { OrderCaseDetailsHeader } from '../../components/pageHeaders/OrderCaseDetailsHeader'
import { useCaseDetailsContext } from '../../context/details/caseDetails.context'
import { CaseDetailsPageProvider } from '../../context/details/caseDetails.provider'

type OrderCaseDetailsPayload = {
  orderCaseClientId?: string
  orderCaseId?: number
  freshAfter?: string | null
}

const BOTTOM_STICKY_THRESHOLD_PX = 48

const CaseDetailsPageContent = () => {
  const { orderCase, detailsActions, currentUserId, isRefreshing } = useCaseDetailsContext()

  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const previousChatCountRef = useRef(0)
  const [showNewMessagesPill, setShowNewMessagesPill] = useState(false)

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = chatScrollRef.current
    if (!container) {
      return
    }

    container.scrollTo({ top: container.scrollHeight, behavior })
  }

  useEffect(() => {
    if (!orderCase) {
      return
    }

    shouldStickToBottomRef.current = true
    setShowNewMessagesPill(false)
    previousChatCountRef.current = 0

    const frame = requestAnimationFrame(() => {
      scrollToBottom('auto')
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [orderCase?.id])

  useEffect(() => {
    const chats = orderCase?.chats ?? []
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
  }, [currentUserId, orderCase?.chats])

  const handleScroll = () => {
    const container = chatScrollRef.current
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

  if (!orderCase) {
    return (
      <div className="m-4 rounded-[22px] border border-[var(--color-border)] bg-[rgba(14,22,23,0.72)] p-4 text-sm text-[var(--color-muted)] backdrop-blur-xl">
        {isRefreshing ? 'Loading case details...' : 'Case not found.'}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col border-l-1 border-l-[var(--color-primary)]/30 bg-[var(--color-page)]">
      <OrderCaseDetailsHeader
        title={orderCase.label?.trim() ? orderCase.label : `Case #${orderCase.id}`}
        state={orderCase.state}
        onChangeState={detailsActions.changeState}
        onClose={detailsActions.closeCaseDetails}
      />

      <div ref={chatScrollRef} className="flex-1 overflow-y-auto scroll-thin px-5 pb-2 pt-3" onScroll={handleScroll}>
        {isRefreshing ? (
          <div className="mb-3 rounded-[20px] border border-[var(--color-border)] bg-[rgba(14,22,23,0.72)] px-4 py-3 text-xs text-[var(--color-muted)] backdrop-blur-xl">
            Refreshing case details...
          </div>
        ) : null}
        <OrderCaseChatList chats={orderCase.chats} currentUserId={currentUserId} />
      </div>

      <div className="flex justify-center px-5 pb-2">
        {showNewMessagesPill ? (
          <button
            className="mb-2 flex w-max items-center gap-2 rounded-full border border-[rgba(131,204,185,0.26)] bg-[linear-gradient(135deg,rgba(72,180,194,0.16),rgba(111,224,207,0.08))] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-[0_12px_28px_rgba(0,0,0,0.14)] backdrop-blur-xl transition hover:bg-[linear-gradient(135deg,rgba(72,180,194,0.22),rgba(111,224,207,0.1))]"
            onClick={handleJumpToLatest}
            type="button"
          >
            <span>New messages</span>
            <span className="text-base font-bold leading-none">↓</span>
          </button>
        ) : null}
      </div>

      <div className="px-5 pb-5">
        <OrderCaseChatComposer
          value={detailsActions.message}
          onChange={detailsActions.setMessage}
          onSend={detailsActions.addChat}
          disabled={!detailsActions.message.trim()}
        />
      </div>
    </div>
  )
}

export const CaseDetailsPage = ({ payload, onClose }: StackComponentProps<OrderCaseDetailsPayload>) => {
  const orderCaseClientId = payload?.orderCaseClientId
  const orderCaseId = payload?.orderCaseId

  if (!orderCaseClientId && typeof orderCaseId !== 'number') {
    return (
      <div className="m-4 rounded-[22px] border border-[var(--color-border)] bg-[rgba(14,22,23,0.72)] p-4 text-sm text-[var(--color-muted)] backdrop-blur-xl">
        Missing case id.
      </div>
    )
  }

  return (
    <CaseDetailsPageProvider
      orderCaseClientId={orderCaseClientId ?? null}
      orderCaseId={orderCaseId ?? null}
      freshAfter={payload?.freshAfter ?? null}
      onClose={onClose}
    >
      <CaseDetailsPageContent />
    </CaseDetailsPageProvider>
  )
}
