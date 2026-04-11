import { useMemo } from 'react'

import { EMAIL_EVENTS  } from '@/features/messaging/emailMessage/domain/emailEvents'

import type { EmailMessageTemplate } from '../types'
import type { EventDefinition } from '../domain/emailEvents'

export type EmailMessageTriggerCard = {
  trigger: EventDefinition
  status: string
}

type UseEmailMessageModelArgs = {
  templates: EmailMessageTemplate[]
  searchQuery: string
  activeTrigger: EventDefinition | null
}

export const useEmailMessageModel = ({
  templates,
  searchQuery,
  activeTrigger,
}: UseEmailMessageModelArgs) => {
  const templateByEvent = useMemo(
    () =>
      templates.reduce<Record<string, EmailMessageTemplate>>((acc, template) => {
        acc[template.event] = template
        return acc
      }, {}),
    [templates],
  )

  const existingTemplate = useMemo(
    () => (activeTrigger ? templateByEvent[activeTrigger.key] ?? null : null),
    [activeTrigger, templateByEvent],
  )

  const filteredTriggers = useMemo<EmailMessageTriggerCard[]>(() => {
    const query = searchQuery.trim().toLowerCase()
    const triggers = query
      ? EMAIL_EVENTS.filter((trigger) => {
          const template = templateByEvent[trigger.key]
          const templateName = template?.name ?? ''
          return (
            trigger.label.toLowerCase().includes(query)
            || templateName.toLowerCase().includes(query)
          )
        })
      : EMAIL_EVENTS

    return triggers.map((trigger) => {
      const template = templateByEvent[trigger.key]
      const status = template
        ? template.enable
          ? 'Enabled'
          : 'Disabled'
        : 'Not configured'
      return { trigger, status }
    })
  }, [searchQuery, templateByEvent])

  return { existingTemplate, filteredTriggers }
}
