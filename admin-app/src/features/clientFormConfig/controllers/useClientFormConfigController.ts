import { useState } from 'react'

import { useClientFormMediaFlow } from '../flows/clientFormMedia.flow'
import { useClientFormRulesFlow } from '../flows/clientFormRules.flow'
import { useClientFormSettingsFlow } from '../flows/clientFormSettings.flow'

export type ClientFormConfigTabKey = 'terms' | 'rules' | 'media'

export const CLIENT_FORM_CONFIG_TABS: { key: ClientFormConfigTabKey; label: string }[] = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'rules', label: 'Rules' },
  { key: 'media', label: 'Media' },
]

/**
 * Owns the tab shell. Settings, rules and media load once here rather than per
 * tab, so switching tabs never re-fetches. Terms history loads lazily in its own
 * tab because it grows unbounded.
 */
export const useClientFormConfigController = () => {
  useClientFormSettingsFlow()
  useClientFormRulesFlow()
  useClientFormMediaFlow()

  const [activeTab, setActiveTab] = useState<ClientFormConfigTabKey>('terms')

  return { activeTab, setActiveTab, tabs: CLIENT_FORM_CONFIG_TABS }
}
