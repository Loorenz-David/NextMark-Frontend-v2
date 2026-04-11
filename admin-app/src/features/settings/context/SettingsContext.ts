import { createContext, useContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import type { SettingsSectionPayloads } from '../registry/sectionRegistry'
import type { SettingsPopupsPayloads } from '../registry/popupRegistry'





export type SettingsContextValue = {
  sectionManager: StackActionManager<SettingsSectionPayloads>
  popupManager: StackActionManager<SettingsPopupsPayloads>
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider')
  }
  return context
}

export const useSectionManager = () => useSettingsContext().sectionManager

export const usePopupManager = () => useSettingsContext().popupManager
