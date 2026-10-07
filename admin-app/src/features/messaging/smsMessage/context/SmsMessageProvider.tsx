import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import {
  createImmediateMessageScheduleDraft,
  findTemplateForScope,
  mapMessageScheduleFieldsToDraft,
  type MessageScheduleDraft,
} from '@/features/messaging/domain'
import type { RoutePlanObjective } from '@/features/plan'

import { SMS_EVENTS } from '../domain/smsEvents'
import type { EventDefinition  } from '../domain/smsEvents'
import { useSmsMessageController, useSmsMessageEditor, useSmsMessageFlow, useSmsMessages } from '../hooks'

import { SmsMessageContext } from './SmsMessageContext'

type SmsMessageProviderProps = PropsWithChildren<{
  planType: RoutePlanObjective
}>

export const SmsMessageProvider = ({ planType, children }: SmsMessageProviderProps) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const templates = useSmsMessages()
  const { loadTemplates } = useSmsMessageFlow()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTrigger, setActiveTrigger] = useState<EventDefinition | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission ] = useState(false)
  const [schedule, setSchedule] = useState<MessageScheduleDraft>(createImmediateMessageScheduleDraft)
  const { saveTemplate: persistTemplate } = useSmsMessageController({setActiveTrigger})

  const existingTemplate = useMemo(
    () => (activeTrigger ? findTemplateForScope(templates, activeTrigger.key, planType) : null),
    [activeTrigger, planType, templates],
  )

  const { value: editorValue, setValue } = useSmsMessageEditor(
    existingTemplate?.template ?? existingTemplate?.content,
  )

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // An open editor belongs to the previous plan type's template; leave it.
  useEffect(() => {
    setActiveTrigger(null)
  }, [planType])

  useEffect(() => {
    setEnabled(existingTemplate?.enable ?? false)
  }, [existingTemplate])

  useEffect(() => {
    setPermission(existingTemplate?.ask_permission ?? false)
  }, [existingTemplate])

  useEffect(() => {
    setSchedule(mapMessageScheduleFieldsToDraft(existingTemplate, activeTrigger?.key))
  }, [activeTrigger?.key, existingTemplate])

  const filteredTriggers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const events = query
      ? SMS_EVENTS.filter((event) => {
          const template = findTemplateForScope(templates, event.key, planType)
          const templateName = template?.name ?? ''
          return (
            event.label.toLowerCase().includes(query) ||
            templateName.toLowerCase().includes(query)
          )
        })
      : SMS_EVENTS

    return events.map((event) => {
      const template = findTemplateForScope(templates, event.key, planType)
      const status = template
        ? template.enable
          ? 'Enabled'
          : 'Disabled'
        : 'Not configured'
      return { trigger: event, status }
    })
  }, [planType, searchQuery, templates])

  const saveTemplate = useMemo(
    () => () =>
      activeTrigger
        ? persistTemplate({
            event: activeTrigger.key,
            plan_type: planType,
            template: editorValue,
            enable: enabled,
            ask_permission: permission,
            existing: existingTemplate ?? null,
            name: activeTrigger.label,
            schedule,
          })
        : Promise.resolve(false),
    [activeTrigger, editorValue, enabled, existingTemplate, permission, persistTemplate, planType, schedule],
  )

  const contextValue = useMemo(
    () => ({
      sectionManager,
      popupManager,
      planType,
      templates,
      filteredTriggers,
      searchQuery,
      setSearchQuery,
      activeTrigger,
      setActiveTrigger,
      enabled,
      permission,
      setEnabled,
      setPermission,
      schedule,
      setSchedule,
      value: editorValue,
      setValue,
      saveTemplate,
    }),
    [
      activeTrigger,
      enabled,
      filteredTriggers,
      permission,
      planType,
      popupManager,
      saveTemplate,
      schedule,
      searchQuery,
      sectionManager,
      setValue,
      templates,
      editorValue,
    ],
  )

  return <SmsMessageContext.Provider value={contextValue}>{children}</SmsMessageContext.Provider>
}
