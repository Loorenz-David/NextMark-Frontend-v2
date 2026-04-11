import { useCallback, type Dispatch, type SetStateAction } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateSmsMessage, useUpdateSmsMessage } from '../api/smsMessageApi'
import { upsertSmsMessage } from '../store/smsMessageStore'
import type { SmsMessageTemplate, SmsMessageTemplatePayload, TemplateValue } from '../types/smsMessage'
import type { EventDefinition } from '../domain/smsEvents'



type UseSmsMessageControllerParams = {
  setActiveTrigger: Dispatch<SetStateAction<EventDefinition | null>>
}

export const useSmsMessageController = ({ setActiveTrigger }: UseSmsMessageControllerParams) => {
  const { showMessage } = useMessageHandler()
  const createTemplate = useCreateSmsMessage()
  const updateTemplate = useUpdateSmsMessage()

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
    existing?: SmsMessageTemplate | null
    name: string
  }) => {
    const payload: SmsMessageTemplatePayload = {
      client_id: existing?.client_id ?? buildClientId('message_template'),
      name,
      event,
      enable,
      ask_permission,
      template,
      channel: 'sms',
    }
    

    try {
      if (existing?.id) {
        await updateTemplate(existing.id, payload)
        upsertSmsMessage({ ...existing, ...payload })
      } else {
        const response = await createTemplate(payload)
        const newId = response.data?.[payload.client_id]
        upsertSmsMessage({ ...payload, id: newId ?? existing?.id })
      }
      setActiveTrigger(null)
      showMessage({ status: 200, message: 'Template saved.' })
      return true
    } catch (error) {
      console.error('Failed to save SMS template', error)
      showMessage({ status: 500, message: 'Unable to save template.' })
      return false
    }
  }, [createTemplate, showMessage, updateTemplate])

  return { saveTemplate }
}
