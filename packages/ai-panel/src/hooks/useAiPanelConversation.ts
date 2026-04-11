import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { clearPersistedThread, readPersistedThread, writePersistedThread } from '../layout'
import { createAiPanelMessage } from '../message'
import type {
  AiCapabilityOption,
  AiActionDescriptor,
  AiMessageContext,
  AiCapabilityMode,
  AiPanelController,
  AiPanelMessage,
  AiTransportAdapter,
} from '../types'

interface UseAiPanelConversationParams {
  transport: AiTransportAdapter
  storageKey: string
  maxMessages?: number
  capabilityOptions?: AiCapabilityOption[]
  resolveAction?: (action: AiActionDescriptor) => void | Promise<void>
  onOpen: () => void
  onToggle: () => void
  onClose: () => void
}

interface AiPanelConversationState {
  controller: AiPanelController
  composerValue: string
  setComposerValue: (value: string) => void
  loadingStatusText: string
  capabilityMode: AiCapabilityMode
  selectedCapabilityId: string
  setCapabilitySelection: (value: string) => void
  activeActionId: string | null
  runAction: (action: AiActionDescriptor) => Promise<void>
}

function trimMessages(messages: AiPanelMessage[], maxMessages?: number) {
  if (!maxMessages || maxMessages <= 0) {
    return messages
  }

  return messages.slice(-maxMessages)
}

export function useAiPanelConversation({
  transport,
  storageKey,
  maxMessages,
  capabilityOptions = [],
  resolveAction,
  onOpen,
  onToggle,
  onClose,
}: UseAiPanelConversationParams): AiPanelConversationState {
  const [threadId, setThreadId] = useState<string | null>(() => readPersistedThread(storageKey))
  const [messages, setMessages] = useState<AiPanelMessage[]>([])
  const [composerValue, setComposerValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatusText, setLoadingStatusText] = useState('')
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [capabilityMode, setCapabilityMode] = useState<AiCapabilityMode>('auto')
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<string>(capabilityOptions[0]?.id ?? '')
  const lastPromptRef = useRef<string | null>(null)

  useEffect(() => {
    if (selectedCapabilityId || capabilityOptions.length === 0) {
      return
    }

    setSelectedCapabilityId(capabilityOptions[0]?.id ?? '')
  }, [capabilityOptions, selectedCapabilityId])

  // On mount: if we have a persisted threadId and transport supports loadThread,
  // restore the conversation history.
  useEffect(() => {
    const persistedThreadId = readPersistedThread(storageKey)
    if (!persistedThreadId || !transport.loadThread) return

    let cancelled = false
    transport.loadThread(persistedThreadId).then((state) => {
      if (cancelled) return
      setThreadId(state.threadId)
      setMessages(state.messages)
    }).catch(() => {
      // Thread expired or inaccessible — clear persisted id
      clearPersistedThread(storageKey)
      setThreadId(null)
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount only

  const clearConversation = useCallback(() => {
    setMessages([])
    setThreadId(null)
    setComposerValue('')
    setLoadingStatusText('')
    lastPromptRef.current = null
    clearPersistedThread(storageKey)
  }, [storageKey])

  const setCapabilitySelection = useCallback((value: string) => {
    if (value === '__auto__') {
      setCapabilityMode('auto')
      return
    }

    setCapabilityMode('manual')
    setSelectedCapabilityId(value)
  }, [])

  const send = useCallback(
    async (message?: string, context?: AiMessageContext) => {
      const nextMessage = (message ?? composerValue).trim()
      if (!nextMessage || isLoading) {
        return
      }

      onOpen()
      setComposerValue('')
      setLoadingStatusText('')
      setMessages((current) => trimMessages([
        ...current,
        createAiPanelMessage({ role: 'user', content: nextMessage }),
      ], maxMessages))
      setIsLoading(true)
      lastPromptRef.current = nextMessage

      let activeThreadId = threadId
      if (!activeThreadId) {
        const createdThread = await transport.createThread()
        activeThreadId = createdThread.threadId
        setThreadId(createdThread.threadId)
        writePersistedThread(storageKey, createdThread.threadId)
      }

      let stopPolling = () => undefined

      try {
        if (transport.pollLoadingStatus) {
          let cancelled = false
          const poll = async () => {
            if (cancelled) {
              return
            }

            try {
              const result = await transport.pollLoadingStatus?.({
                threadId: activeThreadId!,
                lastMessage: nextMessage,
              })

              if (!cancelled && typeof result?.message === 'string') {
                setLoadingStatusText(result.message)
              }
            } catch {
              // Loading status is additive only; failures should not break the main request.
            }
          }

          void poll()
          const interval = window.setInterval(() => {
            void poll()
          }, 1500)

          stopPolling = () => {
            cancelled = true
            window.clearInterval(interval)
          }
        }

        const effectiveContext: AiMessageContext = {
          ...(context ?? {}),
          capability_mode: capabilityMode,
          capability_id: capabilityMode === 'manual' ? selectedCapabilityId : undefined,
        }

        const response = await transport.sendMessage({
          threadId: activeThreadId,
          message: nextMessage,
          context: effectiveContext,
        })

        setThreadId(response.threadId)
        setMessages((current) => trimMessages([
          ...current,
          createAiPanelMessage({
            role: response.message.role ?? 'assistant',
            content: response.message.content,
            statusLabel: response.message.statusLabel,
            intent: response.message.intent,
            narrativePolicy: response.message.narrativePolicy,
            renderingHints: response.message.renderingHints,
            typedWarnings: response.message.typedWarnings,
            blocks: response.message.blocks,
            actions: response.message.actions,
            toolTrace: response.message.toolTrace,
            data: response.message.data,
            interactions: response.message.interactions,
          }),
        ], maxMessages))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'The AI request failed.'
        setMessages((current) => trimMessages([
          ...current,
          createAiPanelMessage({ role: 'error', content: errorMessage }),
        ], maxMessages))
      } finally {
        stopPolling()
        setIsLoading(false)
        setLoadingStatusText('')
      }
    },
    [capabilityMode, composerValue, isLoading, maxMessages, onOpen, selectedCapabilityId, storageKey, threadId, transport],
  )

  const retryLast = useCallback(async () => {
    if (!lastPromptRef.current) {
      return
    }

    await send(lastPromptRef.current)
  }, [send])

  const runAction = useCallback(
    async (action: AiActionDescriptor) => {
      if (!resolveAction || action.disabled) {
        return
      }

      const actionId = action.id ?? `${action.type}-${action.label}`
      setActiveActionId(actionId)

      try {
        await resolveAction(action)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'The AI action failed.'
        setMessages((current) => [
          ...current,
          createAiPanelMessage({ role: 'error', content: errorMessage }),
        ])
      } finally {
        setActiveActionId(null)
      }
    },
    [resolveAction],
  )

  const controller = useMemo<AiPanelController>(
    () => ({
      isOpen: false,
      isLoading,
      threadId,
      messages,
      open: onOpen,
      close: onClose,
      toggle: onToggle,
      clearConversation,
      retryLast,
      send,
    }),
    [clearConversation, isLoading, messages, onClose, onOpen, onToggle, retryLast, send, threadId],
  )

  return {
    controller,
    composerValue,
    setComposerValue,
    loadingStatusText,
    capabilityMode,
    selectedCapabilityId,
    setCapabilitySelection,
    activeActionId,
    runAction,
  }
}
