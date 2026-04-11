import { useCallback, type Dispatch, type SetStateAction } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateEmailMessage, useUpdateEmailMessage } from '../api/emailMessageApi'
import { upsertEmailMessage } from '../store/emailMessageStore'
import type { EmailMessageTemplate, EmailMessageTemplatePayload, TemplateValue } from '../types/emailMessage'
import type { EventDefinition } from '../domain/emailEvents'


type UseEmailMessageControllerParams = {
  setActiveTrigger: Dispatch<SetStateAction<EventDefinition | null>>
}

export const useEmailMessageController = ({ setActiveTrigger }: UseEmailMessageControllerParams) => {
  const { showMessage } = useMessageHandler()
  const createTemplate = useCreateEmailMessage()
  const updateTemplate = useUpdateEmailMessage()

  const saveTemplate = useCallback(async ({
    event,
    template,
    enable,
    ask_permission,
    existing,
    name,
  }: {
    event: string
    template: TemplateValue
    enable: boolean
    ask_permission:boolean
    existing?: EmailMessageTemplate | null
    name: string
  }) => {
    const payload: EmailMessageTemplatePayload = {
      client_id: existing?.client_id ?? buildClientId('message_template'),
      name,
      event,
      enable,
      ask_permission,
      template,
      channel: 'email',
    }

    try {
      if (existing?.id) {
        await updateTemplate(existing.id, payload)
        upsertEmailMessage({ ...existing, ...payload })
      } else {
        const response = await createTemplate(payload)
        const newId = response.data?.[payload.client_id]
        upsertEmailMessage({ ...payload, id: newId ?? existing?.id })
      }
      setActiveTrigger(null)
      showMessage({ status: 200, message: 'Template saved.' })
      return true
    } catch (error) {
      console.error('Failed to save email template', error)
      showMessage({ status: 500, message: 'Unable to save template.' })
      return false
    }
  }, [
    createTemplate,
    setActiveTrigger,
    showMessage,
    updateTemplate,
  ])

  return { saveTemplate }
}
