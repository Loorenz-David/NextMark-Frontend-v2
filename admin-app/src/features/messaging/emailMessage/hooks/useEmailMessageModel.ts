import { useMemo } from 'react'

import { EMAIL_EVENTS  } from '@/features/messaging/emailMessage/domain/emailEvents'
import { matchesTemplateScope } from '@/features/messaging/domain'
import type { RoutePlanObjective } from '@/features/plan'

import type { EmailMessageTemplate } from '../types'
import type { EventDefinition } from '../domain/emailEvents'

export type EmailMessageTriggerCard = {
  trigger: EventDefinition
  status: string
}

type UseEmailMessageModelArgs = {
  templates: EmailMessageTemplate[]
  planType: RoutePlanObjective
  searchQuery: string
  activeTrigger: EventDefinition | null
}

export const useEmailMessageModel = ({
  templates,
  planType,
  searchQuery,
  activeTrigger,
}: UseEmailMessageModelArgs) => {
  // One template per event once narrowed to the selected plan type; the other
  // plan types' templates for the same event must not shadow it.
  const templateByEvent = useMemo(
    () =>
      EMAIL_EVENTS.reduce<Record<string, EmailMessageTemplate>>((acc, trigger) => {
        const template = templates.find((item) => matchesTemplateScope(item, trigger.key, planType))
        if (template) {
          acc[trigger.key] = template
        }
        return acc
      }, {}),
    [planType, templates],
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
