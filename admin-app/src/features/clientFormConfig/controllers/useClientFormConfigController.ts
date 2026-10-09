import { useState } from 'react'

import { useClientFormMediaFlow } from '../flows/clientFormMedia.flow'
import { useClientFormRedirectsFlow } from '../flows/clientFormRedirects.flow'
import { useClientFormRulesFlow } from '../flows/clientFormRules.flow'
import { useClientFormSettingsFlow } from '../flows/clientFormSettings.flow'

export type ClientFormConfigTabKey = 'terms' | 'rules' | 'media' | 'redirect'

export const CLIENT_FORM_CONFIG_TABS: { key: ClientFormConfigTabKey; label: string }[] = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'rules', label: 'Rules' },
  { key: 'media', label: 'Media' },
  { key: 'redirect', label: 'Redirect' },
]

/**
 * Owns the tab shell. Settings, rules, media and redirects load once here rather than per
 * tab, so switching tabs never re-fetches. Terms history loads lazily in its own
 * tab because it grows unbounded.
 */
export const useClientFormConfigController = () => {
  useClientFormSettingsFlow()
  useClientFormRulesFlow()
  useClientFormMediaFlow()
  useClientFormRedirectsFlow()

  const [activeTab, setActiveTab] = useState<ClientFormConfigTabKey>('terms')

  return { activeTab, setActiveTab, tabs: CLIENT_FORM_CONFIG_TABS }
}
