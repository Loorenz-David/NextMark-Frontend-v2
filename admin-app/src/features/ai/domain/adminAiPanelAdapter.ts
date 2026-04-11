import type {
  AiActionDescriptor,
  AiMessageBlock,
  AiPanelMessage,
  AiPanelResponse,
  AiThreadState,
  AiToolTraceEntry,
  AiTransportAdapter,
} from '@nextmark/ai-panel'

import { aiApi } from '../api/ai.api'
import { normalizeAiAnalyticsBlockData } from './normalizeAiAnalyticsBlockData'
import type { AIAction, AIBlock, AIThreadMessageResponse, AIToolTraceEntry } from '../types/ai'

// ---------------------------------------------------------------------------
// V2 normalizers
// ---------------------------------------------------------------------------

function normalizeV2Action(action: AIAction): AiActionDescriptor {
  return {
    id: action.id,
    type: action.type,
    label: action.label,
    payload: action.payload,
    hint: action.hint,
    disabled: action.disabled,
  }
}

function normalizeV2ToolTrace(entry: AIToolTraceEntry): AiToolTraceEntry {
  return {
    id: entry.id,
    tool: entry.tool,
    status: entry.status,
    summary: entry.summary,
    params: entry.params,
    result: entry.result,
  }
}

function normalizeV2Block(block: AIBlock): AiMessageBlock | null {
  const normalizedBlock: AiMessageBlock = {
    id: block.id,
    kind: block.kind,
    entityType: block.entity_type,
    layout: block.layout,
    title: block.title,
    subtitle: block.subtitle,
    data: block.data,
    actions: (block.actions ?? []).map(normalizeV2Action),
    meta: block.meta,
  }

  if (normalizedBlock.kind === 'analytics' || normalizedBlock.entityType === 'analytics') {
    const normalizedData = normalizeAiAnalyticsBlockData(normalizedBlock)
    if (!normalizedData) {
      return null
    }

    return {
      ...normalizedBlock,
      data: normalizedData,
    }
  }

  return normalizedBlock
}

function normalizeMessageContent(message: AIThreadMessageResponse['message']) {
  return {
    role: message.role,
    content: message.content || 'Done.',
    statusLabel: message.status_label ?? 'Completed',
    intent: message.intent,
    narrativePolicy: message.narrative_policy,
    renderingHints: message.rendering_hints,
    typedWarnings: message.typed_warnings,
    blocks: (message.blocks ?? [])
      .map(normalizeV2Block)
      .filter((block): block is AiMessageBlock => block !== null),
    actions: (message.actions ?? []).map(normalizeV2Action),
    toolTrace: (message.tool_trace ?? []).map(normalizeV2ToolTrace),
    data: message.data ?? null,
  }
}

export function normalizeV2Response(response: AIThreadMessageResponse): AiPanelResponse {
  return {
    threadId: response.thread_id,
    message: normalizeMessageContent(response.message),
  }
}

// ---------------------------------------------------------------------------
// Transport adapter — uses V2 backend thread API
// ---------------------------------------------------------------------------

export const adminAiPanelTransport: AiTransportAdapter = {
  createThread: async () => {
    const result = await aiApi.createThread()
    return { threadId: result.thread_id }
  },

  sendMessage: async ({ threadId, message, context }) => {
    const response = await aiApi.sendMessage(threadId, { message, context })
    return normalizeV2Response(response)
  },

  loadThread: async (threadId: string): Promise<AiThreadState> => {
    const result = await aiApi.getThread(threadId)
    const messages: AiPanelMessage[] = result.messages
      .filter((t) => t.role === 'user' || t.role === 'assistant')
      .map((turn) => ({
        id: turn.id,
        role: turn.role as 'user' | 'assistant',
        content: turn.content,
        createdAt: new Date(turn.created_at).getTime(),
        statusLabel: turn.status_label,
        intent: turn.intent,
        narrativePolicy: turn.narrative_policy,
        renderingHints: turn.rendering_hints,
        typedWarnings: turn.typed_warnings,
        blocks: (turn.blocks ?? [])
          .map(normalizeV2Block)
          .filter((block): block is AiMessageBlock => block !== null),
        actions: turn.actions?.map(normalizeV2Action),
        toolTrace: turn.tool_trace?.map(normalizeV2ToolTrace),
        data: turn.data,
      }))
    return { threadId: result.thread_id, messages }
  },
}
