import { useCallback } from 'react'

import { useGetSmsMessages } from '../api/smsMessageApi'
import { insertSmsMessages, upsertSmsMessage } from '../store/smsMessageStore'
import type { SmsMessageTemplate } from '../types/smsMessage'

const normalizeTemplates = (payload: unknown): SmsMessageTemplate[] => {
  if (!payload) {
    return []
  }
  if (Array.isArray(payload)) {
    return payload as SmsMessageTemplate[]
  }
  if (typeof payload === 'object' && payload !== null && 'byClientId' in payload) {
    const map = payload as { byClientId: Record<string, SmsMessageTemplate> }
    return Object.values(map.byClientId)
  }
  return []
}

// One row per (event, plan type); well above the backend's default page size.
const TEMPLATE_LIST_LIMIT = 200

export const useSmsMessageFlow = () => {
  const getTemplates = useGetSmsMessages()

  const loadTemplates = useCallback(async () => {
    const response = await getTemplates({ limit: TEMPLATE_LIST_LIMIT })
    const templates = normalizeTemplates(response.data?.message_templates)

    if (response.data?.message_templates && typeof response.data.message_templates === 'object' && 'byClientId' in response.data.message_templates) {
      const map = response.data.message_templates as { byClientId: Record<string, SmsMessageTemplate>; allIds: string[] }
      insertSmsMessages(map)
      return templates
    }

    templates.forEach((template) => upsertSmsMessage(template))
    return templates
  }, [getTemplates])

  return { loadTemplates }
}
