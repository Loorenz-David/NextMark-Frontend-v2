import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import type { MessageScheduleDraft } from '@/features/messaging/domain'

import type { EventDefinition } from '../domain/emailEvents'
import type { EmailMessageTemplate } from '../types/emailMessage'
import type { EmailTemplateValue } from '../types'

export type EmailMessageTriggerCard = {
  trigger: EventDefinition
  status: string
}

export type EmailMessageContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
  templates: EmailMessageTemplate[]
  filteredTriggers: EmailMessageTriggerCard[]
  searchQuery: string
  setSearchQuery: (value: string) => void
  activeTrigger: EventDefinition | null
  setActiveTrigger: (trigger: EventDefinition | null) => void
  enabled: boolean
  setEnabled: (value: boolean) => void
  setPermission: (value: boolean) => void
  permission: boolean
  schedule: MessageScheduleDraft
  setSchedule: (value: MessageScheduleDraft) => void
  value: EmailTemplateValue
  setValue: (value: EmailTemplateValue) => void
  saveTemplate: () => Promise<boolean>
}

export const EmailMessageContext = createContext<EmailMessageContextValue | null>(null)
