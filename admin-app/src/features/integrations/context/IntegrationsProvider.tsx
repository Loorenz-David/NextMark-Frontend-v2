import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { usePopupManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import { useIntegrationsFlow } from '../hooks/useIntegrationsFlow'
import { useIntegrationsActions } from '../hooks/useIntegrationsActions'

import { IntegrationsContext } from './IntegrationsContext'

export const IntegrationsProvider = ({ children }: PropsWithChildren) => {
  const sectionManager = useSectionManager()
  const popupManager = usePopupManager()
  const { integrations: activeDefinitions, clearIntegration } = useIntegrationsFlow()
  const actions = useIntegrationsActions({ onRemoved: clearIntegration })

  const integrations = useMemo(
    () =>
      activeDefinitions.map((definition) => ({
        definition,
      })),
    [activeDefinitions],
  )

  const value = useMemo(
    () => ({
      sectionManager,
      popupManager,
      integrations,
      openIntegrationConfig: actions.openIntegrationConfig,
      removeIntegration: actions.removeIntegration,
    }),
    [actions.openIntegrationConfig, actions.removeIntegration, integrations, popupManager, sectionManager],
  )

  return <IntegrationsContext.Provider value={value}>{children}</IntegrationsContext.Provider>
}
