import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Descendant } from 'slate'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import {
  createImmediateMessageScheduleDraft,
  mapMessageScheduleFieldsToDraft,
  type MessageScheduleDraft,
} from '@/features/messaging/domain'

import type { EventDefinition } from '../domain/emailEvents'
import {
  useEmailMessageController,
  useEmailMessageEditor,
  useEmailMessageFlow,
  useEmailMessageModel,
  useEmailMessages,
} from '../hooks'
import { DEFAULT_EMAIL_TEMPLATE } from '../domain'
import { normalizeEmailSubjectTemplateValue } from '../domain'

import type { EmailMessageContextValue } from './EmailMessageContext'
import { EmailMessageContext } from './EmailMessageContext'

export const EmailMessageProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const templates = useEmailMessages()
  const { loadTemplates } = useEmailMessageFlow()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTrigger, setActiveTrigger] = useState<EventDefinition | null>(null)
  const [enabled, setEnabled] = useState(false) 
  const [permission, setPermission ] = useState(false)
  const [subject, setSubject] = useState<Descendant[]>(() => normalizeEmailSubjectTemplateValue())
  const [schedule, setSchedule] = useState<MessageScheduleDraft>(createImmediateMessageScheduleDraft)
  const { existingTemplate, filteredTriggers } = useEmailMessageModel({
    templates,
    searchQuery,
    activeTrigger,
  })

  const { value: editorValue, setValue } = useEmailMessageEditor(
    existingTemplate?.template ?? existingTemplate?.content ?? DEFAULT_EMAIL_TEMPLATE,
  )

  const { saveTemplate: persistTemplate } = useEmailMessageController({ setActiveTrigger })
  
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    setEnabled(existingTemplate?.enable ?? false)
  }, [existingTemplate])

  useEffect(() => {
    setPermission(existingTemplate?.ask_permission ?? false)
  }, [existingTemplate])

  useEffect(() => {
    setSubject(normalizeEmailSubjectTemplateValue(existingTemplate?.subject))
  }, [existingTemplate])

  useEffect(() => {
    setSchedule(mapMessageScheduleFieldsToDraft(existingTemplate, activeTrigger?.key))
  }, [activeTrigger?.key, existingTemplate])

  const saveTemplate = useMemo(
    () => () =>
      activeTrigger
        ? persistTemplate({
            event: activeTrigger.key,
            template: editorValue,
            enable: enabled,
            subject,
            existing: existingTemplate ?? null,
            ask_permission: permission,
            name: activeTrigger.label,
            schedule,
          })
        : Promise.resolve(false),
    [activeTrigger, editorValue, enabled, existingTemplate, permission, persistTemplate, schedule, subject],
  )

  const contextValue: EmailMessageContextValue = useMemo(
    () => ({
      sectionManager,
      popupManager,
      templates,
      filteredTriggers,
      searchQuery,
      setSearchQuery,
      activeTrigger,
      setActiveTrigger,
      enabled,
      setEnabled,
      setPermission,
      permission,
      subject,
      setSubject,
      schedule,
      setSchedule,
      value: editorValue,
      setValue,
      saveTemplate,
    }),
    [
      activeTrigger,
      editorValue,
      enabled,
      filteredTriggers,
      permission,
      popupManager,
      saveTemplate,
      schedule,
      searchQuery,
      sectionManager,
      subject,
      setValue,
      templates,
    ],
  )

  return <EmailMessageContext.Provider value={contextValue}>{children}</EmailMessageContext.Provider>
}
