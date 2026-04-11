import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { SMS_EVENTS } from '../domain/smsEvents'
import type { EventDefinition  } from '../domain/smsEvents'
import { useSmsMessageController, useSmsMessageEditor, useSmsMessageFlow, useSmsMessages } from '../hooks'

import { SmsMessageContext } from './SmsMessageContext'

export const SmsMessageProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const templates = useSmsMessages()
  const { loadTemplates } = useSmsMessageFlow()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTrigger, setActiveTrigger] = useState<EventDefinition | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission ] = useState(false)
  const { saveTemplate: persistTemplate } = useSmsMessageController({setActiveTrigger})

  const existingTemplate = useMemo(
    () => (activeTrigger ? templates.find((template) => template.event === activeTrigger.key) : null),
    [activeTrigger, templates],
  )
 
  const { value: editorValue, setValue } = useSmsMessageEditor(
    existingTemplate?.template ?? existingTemplate?.content,
  )

  

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    setEnabled(existingTemplate?.enable ?? false)
  }, [existingTemplate])

  const filteredTriggers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const events = query
      ? SMS_EVENTS.filter((event) => {
          const template = templates.find((item) => item.event === event.key)
          const templateName = template?.name ?? ''
          return (
            event.label.toLowerCase().includes(query) ||
            templateName.toLowerCase().includes(query)
          )
        })
      : SMS_EVENTS

    return events.map((event) => {
      const template = templates.find((item) => item.event === event.key)
      const status = template
        ? template.enable
          ? 'Enabled'
          : 'Disabled'
        : 'Not configured'
      return { trigger: event, status }
    })
  }, [searchQuery, templates])

  const saveTemplate = useMemo(
    () => () =>
      activeTrigger
        ? persistTemplate({
            event: activeTrigger.key,
            template: editorValue,
            enable: enabled,
            ask_permission: permission,
            existing: existingTemplate ?? null,
            name: activeTrigger.label,
          })
        : Promise.resolve(false),
    [activeTrigger, editorValue, enabled, existingTemplate, persistTemplate],
  )

  const contextValue = useMemo(
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
      permission,
      setEnabled,
      setPermission,
      value: editorValue,
      setValue,
      saveTemplate,
    }),
    [
      activeTrigger,
      enabled,
      filteredTriggers,
      popupManager,
      saveTemplate,
      searchQuery,
      sectionManager,
      setValue,
      templates,
      editorValue,
    ],
  )

  return <SmsMessageContext.Provider value={contextValue}>{children}</SmsMessageContext.Provider>
}
