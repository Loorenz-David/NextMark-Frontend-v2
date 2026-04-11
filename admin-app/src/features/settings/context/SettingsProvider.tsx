import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { StackActionManager } from '@/shared/stack-manager/StackActionManager'
import { ResourcesManagerProvider } from '@/shared/resource-manager/ResourceManagerContext'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import { MainPopup } from '@/shared/popups/MainPopup/MainPopup'

import type { SettingsSectionPayloads } from '../registry/sectionRegistry'
import type { SettingsPopupsPayloads } from '../registry/popupRegistry'
import { sectionRegistry } from '../registry/sectionRegistry'
import { popupRegistry } from '../registry/popupRegistry'

const SettingsBlueprint = () => <div />

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useMemo(
    () =>
      new StackActionManager<SettingsSectionPayloads>({
        blueprint: SettingsBlueprint,
        stackRegistry: sectionRegistry,
      }),
    [],
  )

  const popupManager = useMemo(
    () =>
      new StackActionManager<SettingsPopupsPayloads>({
        blueprint: MainPopup,
        stackRegistry: popupRegistry,
      }),
    [],
  )

  useStackActionEntries(sectionManager)
  useStackActionEntries(popupManager)

  return (
    <ResourcesManagerProvider managers={{ sectionManager, popupManager }}>
      {children}
    </ResourcesManagerProvider>
  )
}
