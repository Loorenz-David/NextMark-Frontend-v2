import type { PropsWithChildren } from 'react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiPanelProvider, type AiActionDescriptor, type AiTransportAdapter } from '@nextmark/ai-panel'

import { resetQuery, setQueryFilters, setQuerySearch, updateQueryFilters } from '@/features/order/store/orderQuery.store'
import type { OrderQueryFilters } from '@/features/order/types/orderMeta'
import { AdminAiBlockRenderer } from '../components/AdminAiBlockRenderer'
import { AdminAiChartPreloader } from '../components/AdminAiChartPreloader'
import { adminAiPanelTransport, normalizeV2Response } from '../domain/adminAiPanelAdapter'
import { mapLegacyAiDataToBlocks } from '../domain/mapLegacyAiDataToBlocks'
import { normalizeApplyOrderFiltersPayload, type ApplyOrderFiltersPayload } from '../domain/normalizeApplyOrderFiltersPayload'
import { STATISTICAL_NARRATIVE_FIXTURES } from '../domain/statisticalNarrative.fixtures'

type NavigatePayload = {
  path?: string
}

type CopyTextPayload = {
  text?: string
}

const DEV_FIXTURE_COMMAND = '/fixture'
const DEV_LOCAL_THREAD_PREFIX = 'dev_fixture_thread_'

function parseFixtureCommand(message: string): { type: 'list' | 'pick'; index?: number } | null {
  const trimmed = message.trim()
  if (!trimmed.toLowerCase().startsWith(DEV_FIXTURE_COMMAND)) {
    return null
  }

  const [, arg] = trimmed.split(/\s+/, 2)
  if (!arg || arg.toLowerCase() === 'list') {
    return { type: 'list' }
  }

  const index = Number(arg)
  if (!Number.isInteger(index) || index < 1 || index > STATISTICAL_NARRATIVE_FIXTURES.length) {
    return null
  }

  return { type: 'pick', index }
}

export function AdminAiPanelProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()

  const renderBlock = useCallback((props: Parameters<typeof AdminAiBlockRenderer>[0]) => (
    <AdminAiBlockRenderer {...props} />
  ), [])

  const resolveAction = useCallback(
    async (action: AiActionDescriptor) => {
      switch (action.type) {
        case 'navigate': {
          const payload = action.payload as NavigatePayload | undefined
          if (!payload?.path) {
            throw new Error('AI action "navigate" is missing a path.')
          }
          navigate(payload.path)
          return
        }

        case 'open_settings': {
          navigate('/settings')
          return
        }

        case 'apply_order_filters': {
          const payload = action.payload as ApplyOrderFiltersPayload | undefined
          const normalizedPayload = normalizeApplyOrderFiltersPayload(payload)
          navigate('/')

          if (normalizedPayload.mode === 'replace') {
            resetQuery()
          }

          if (typeof normalizedPayload.search === 'string') {
            setQuerySearch(normalizedPayload.search)
          }

          if (Object.keys(normalizedPayload.filters).length > 0) {
            if (normalizedPayload.mode === 'replace') {
              setQueryFilters(normalizedPayload.filters as OrderQueryFilters)
            } else {
              updateQueryFilters(normalizedPayload.filters)
            }
          }
          return
        }

        case 'copy_text': {
          const payload = action.payload as CopyTextPayload | undefined
          if (!payload?.text || !navigator.clipboard) {
            throw new Error('AI action "copy_text" is missing text.')
          }
          await navigator.clipboard.writeText(payload.text)
          return
        }

        default:
          throw new Error(`Unsupported AI action: ${action.type}`)
      }
    },
    [navigate],
  )

  const transport = useMemo<AiTransportAdapter>(() => {
    if (!import.meta.env.DEV) {
      return adminAiPanelTransport
    }

    const remoteThreadByLocalThread = new Map<string, string>()

    const isLocalDevThreadId = (threadId?: string): threadId is string =>
      typeof threadId === 'string' && threadId.startsWith(DEV_LOCAL_THREAD_PREFIX)

    const createLocalDevThreadId = () =>
      `${DEV_LOCAL_THREAD_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const resolveBackendThreadId = async (threadId: string): Promise<string> => {
      if (!isLocalDevThreadId(threadId)) {
        return threadId
      }

      const existing = remoteThreadByLocalThread.get(threadId)
      if (existing) {
        return existing
      }

      const created = await adminAiPanelTransport.createThread()
      remoteThreadByLocalThread.set(threadId, created.threadId)
      return created.threadId
    }

    return {
      ...adminAiPanelTransport,
      createThread: async () => ({
        threadId: createLocalDevThreadId(),
      }),
      sendMessage: async ({ threadId, message, context }) => {
        const command = parseFixtureCommand(message)

        if (!command) {
          if (typeof threadId !== 'string' || !threadId.length) {
            return adminAiPanelTransport.sendMessage({ threadId, message, context })
          }

          const backendThreadId = await resolveBackendThreadId(threadId)
          return adminAiPanelTransport.sendMessage({ threadId: backendThreadId, message, context })
        }

        if (command.type === 'list') {
          return {
            threadId: threadId ?? createLocalDevThreadId(),
            message: {
              role: 'assistant',
              statusLabel: 'Completed',
              content: [
                'Fixture mode is enabled (dev only).',
                `Use "${DEV_FIXTURE_COMMAND} 1" to "${DEV_FIXTURE_COMMAND} ${STATISTICAL_NARRATIVE_FIXTURES.length}" to preview a statistical narrative payload.`,
              ].join(' '),
            },
          }
        }

        const fixtureIndex = command.index
        if (fixtureIndex === undefined) {
          return {
            threadId,
            message: {
              role: 'assistant',
              statusLabel: 'Failed',
              content: 'Invalid fixture command. Use /fixture list or /fixture <number>.',
            },
          }
        }

        const fixture = STATISTICAL_NARRATIVE_FIXTURES[fixtureIndex - 1]
        const normalized = normalizeV2Response({
          ...fixture,
          thread_id: threadId ?? createLocalDevThreadId(),
        })

        return {
          ...normalized,
          threadId: threadId ?? normalized.threadId,
        }
      },
      loadThread: async (threadId: string) => {
        if (isLocalDevThreadId(threadId)) {
          return { threadId, messages: [] }
        }

        if (!adminAiPanelTransport.loadThread) {
          return { threadId, messages: [] }
        }

        return adminAiPanelTransport.loadThread(threadId)
      },
    }
  }, [])

  return (
    <AiPanelProvider
      defaultOpen={false}
      launcherLabel="AI"
      mobileBreakpoint={1000}
      mapLegacyDataToBlocks={mapLegacyAiDataToBlocks}
      placeholder="Ask logistics, planning, or navigation questions..."
      renderBlock={renderBlock}
      resolveAction={resolveAction}
      storageKey="admin-app:ai-companion-panel"
      subtitle="AI logistics operator companion"
      title="NextMark AI"
      transport={transport}
    >
      <AdminAiChartPreloader />
      {children}
    </AiPanelProvider>
  )
}
