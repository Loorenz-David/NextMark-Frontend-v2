import type { availableChannels, availableEvents, PrintTemplate } from '../types'
import { usePrintTemplateStore } from '../store/printDocument.store'

export const resolveActiveTemplateByChannelAndEvent = (
  channel: availableChannels,
  event: availableEvents,
): PrintTemplate | null => {
  const state = usePrintTemplateStore.getState()

  const activeTemplate = state.allIds
    .map((clientId) => state.byClientId[clientId])
    .find((template) => Boolean(template) && template.channel === channel && template.event === event && template.enable)

  return activeTemplate ?? null
}
