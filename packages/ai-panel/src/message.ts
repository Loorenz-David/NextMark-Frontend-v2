import type { AiPanelMessage } from './types'

export function createAiPanelMessage(
  params: Omit<AiPanelMessage, 'id' | 'createdAt'>,
): AiPanelMessage {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ai-panel-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: Date.now(),
    ...params,
  }
}

export async function copyToClipboard(value: string): Promise<void> {
  if (!navigator.clipboard) {
    return
  }

  await navigator.clipboard.writeText(value)
}

export function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
