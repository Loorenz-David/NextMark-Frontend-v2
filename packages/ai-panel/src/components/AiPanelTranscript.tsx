import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AiPanelLoadingStatus } from './AiPanelLoadingStatus'
import { AiPanelMessageCard } from './AiPanelMessageCard'
import { emitPanelMetric } from '../diagnostics'
import {
  buttonStyle,
  emptyStateBodyStyle,
  emptyStateStyle,
  emptyStateTitleStyle,
  statusMessageStyle,
  transcriptStyle,
} from '../styles'
import type { AiActionDescriptor, AiPanelMessage, AiPanelProviderProps, AiPanelTheme } from '../types'

interface AiPanelTranscriptProps {
  messages: AiPanelMessage[]
  isLoading: boolean
  loadingStatusText?: string
  activeActionId: string | null
  theme: AiPanelTheme
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  diagnostics?: AiPanelProviderProps['diagnostics']
  mapLegacyDataToBlocks?: AiPanelProviderProps['mapLegacyDataToBlocks']
  renderBlock?: AiPanelProviderProps['renderBlock']
  runAction: (action: AiActionDescriptor) => Promise<void>
}

const INITIAL_VISIBLE_MESSAGES = 20
const LOAD_OLDER_STEP = 20

export function AiPanelTranscript({
  messages,
  isLoading,
  loadingStatusText,
  activeActionId,
  theme,
  renderEmptyState,
  diagnostics,
  mapLegacyDataToBlocks,
  renderBlock,
  runAction,
}: AiPanelTranscriptProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const previousMessageCountRef = useRef(0)
  const autoLoadingRef = useRef(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_MESSAGES)

  const visibleMessages = useMemo(
    () => messages.slice(Math.max(0, messages.length - visibleCount)),
    [messages, visibleCount],
  )

  const hiddenMessageCount = Math.max(0, messages.length - visibleMessages.length)
  const hasHiddenMessages = hiddenMessageCount > 0

  useEffect(() => {
    const previousCount = previousMessageCountRef.current
    previousMessageCountRef.current = messages.length

    if (messages.length === 0) {
      setVisibleCount(INITIAL_VISIBLE_MESSAGES)
      return
    }

    if (previousCount === 0) {
      setVisibleCount((current) => Math.min(Math.max(current, INITIAL_VISIBLE_MESSAGES), messages.length))
      return
    }

    if (messages.length > previousCount) {
      setVisibleCount((current) => (current >= previousCount ? messages.length : current))
      return
    }

    setVisibleCount((current) => Math.min(current, messages.length))
  }, [messages.length])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) {
      return
    }

    node.scrollTop = node.scrollHeight
  }, [isLoading, messages])

  useEffect(() => {
    emitPanelMetric(diagnostics, 'transcript:render_window', {
      totalMessages: messages.length,
      visibleMessages: visibleMessages.length,
      hiddenMessages: hiddenMessageCount,
    })
  }, [diagnostics, hiddenMessageCount, messages.length, visibleMessages.length])

  const loadOlderMessages = useCallback((trigger: 'manual' | 'auto' = 'manual') => {
    const node = scrollerRef.current
    const previousScrollHeight = node?.scrollHeight ?? 0
    const previousVisibleCount = visibleCount

    setVisibleCount((current) => Math.min(messages.length, current + LOAD_OLDER_STEP))

    const nextVisibleCount = Math.min(messages.length, previousVisibleCount + LOAD_OLDER_STEP)
    const loadedCount = Math.max(0, nextVisibleCount - previousVisibleCount)
    emitPanelMetric(diagnostics, 'transcript:load_older', {
      trigger,
      loadedCount,
      totalMessages: messages.length,
      visibleMessages: nextVisibleCount,
      hiddenMessages: Math.max(0, messages.length - nextVisibleCount),
    })

    if (!node) {
      return
    }

    requestAnimationFrame(() => {
      const nextScrollHeight = node.scrollHeight
      const delta = nextScrollHeight - previousScrollHeight
      node.scrollTop += delta
      autoLoadingRef.current = false
    })
  }, [diagnostics, messages.length, visibleCount])

  const handleScroll = useCallback(() => {
    const node = scrollerRef.current
    if (!node || !hasHiddenMessages || autoLoadingRef.current) {
      return
    }

    if (node.scrollTop > 72) {
      return
    }

    autoLoadingRef.current = true
    loadOlderMessages('auto')
  }, [hasHiddenMessages, loadOlderMessages])

  return (
    <div ref={scrollerRef} onScroll={handleScroll} style={transcriptStyle}>
      {hasHiddenMessages ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => loadOlderMessages('manual')}
            style={buttonStyle(theme, 'ghost')}
            type="button"
          >
            Load older messages ({hiddenMessageCount})
          </button>
        </div>
      ) : null}
      {messages.length === 0 ? (
        <div style={emptyStateStyle(theme)}>
          {renderEmptyState ?? (
            <>
              <div style={emptyStateTitleStyle(theme)}>AI lives above the app.</div>
              <div style={emptyStateBodyStyle(theme)}>
                Ask for plans, orders, filters, and guided navigation without leaving the current workspace.
              </div>
            </>
          )}
        </div>
      ) : null}
      {visibleMessages.map((message) => (
        <AiPanelMessageCard
          key={message.id}
          activeActionId={activeActionId}
          mapLegacyDataToBlocks={mapLegacyDataToBlocks}
          message={message}
          onAction={runAction}
          renderBlock={renderBlock}
          theme={theme}
        />
      ))}
      {isLoading ? (
        <div style={statusMessageStyle(theme)}>
          <AiPanelLoadingStatus
            statusText={loadingStatusText || 'The assistant is resolving the next step.'}
            theme={theme}
          />
        </div>
      ) : null}
    </div>
  )
}
