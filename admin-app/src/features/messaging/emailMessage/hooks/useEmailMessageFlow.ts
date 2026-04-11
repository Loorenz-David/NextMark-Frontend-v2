import { useCallback } from 'react'

import { useGetEmailMessages } from '../api/emailMessageApi'
import { insertEmailMessages, upsertEmailMessage } from '../store/emailMessageStore'
import type { EmailMessageTemplate } from '../types/emailMessage'

const normalizeTemplates = (payload: unknown): EmailMessageTemplate[] => {
  if (!payload) {
    return []
  }
  if (Array.isArray(payload)) {
    return payload as EmailMessageTemplate[]
  }
  if (typeof payload === 'object' && payload !== null && 'byClientId' in payload) {
    const map = payload as { byClientId: Record<string, EmailMessageTemplate> }
    return Object.values(map.byClientId)
  }
  return []
}

export const useEmailMessageFlow = () => {
  const getTemplates = useGetEmailMessages()

  const loadTemplates = useCallback(async () => {
    const response = await getTemplates()
    const templates = normalizeTemplates(response.data?.message_templates)

    if (response.data?.message_templates && typeof response.data.message_templates === 'object' && 'byClientId' in response.data.message_templates) {
      const map = response.data.message_templates as { byClientId: Record<string, EmailMessageTemplate>; allIds: string[] }
      insertEmailMessages(map)
      return templates
    }

    templates.forEach((template) => upsertEmailMessage(template))
    return templates
  }, [getTemplates])

  return { loadTemplates }
}
