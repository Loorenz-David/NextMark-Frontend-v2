import { createContext } from 'react'

import type { Descendant } from 'slate'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

import type { EventDefinition } from '../domain/smsEvents'
import type { SmsMessageTemplate } from '../types/smsMessage'

export type SmsMessageTriggerCard = {
  trigger: EventDefinition
  status: string
}

export type SmsMessageContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
  templates: SmsMessageTemplate[]
  filteredTriggers: SmsMessageTriggerCard[]
  searchQuery: string
  setSearchQuery: (value: string) => void
  activeTrigger: EventDefinition | null
  setActiveTrigger: (trigger: EventDefinition | null) => void
  enabled: boolean
  setEnabled: (value: boolean) => void
  setPermission: (value: boolean) => void
  permission: boolean
  value: Descendant[]
  setValue: (value: Descendant[]) => void
  saveTemplate: () => Promise<boolean>
}

export const SmsMessageContext = createContext<SmsMessageContextValue | null>(null)
