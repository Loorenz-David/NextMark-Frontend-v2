import { createContext } from 'react'

import type { StackActionManager } from '@/shared/stack-manager/StackActionManager'

import type { IntegrationDefinitionWithStatus, IntegrationKey } from '../types/integration'
import type { IntegrationConfigMode } from '../hooks/useIntegrationsActions'

export type IntegrationView = {
  definition: IntegrationDefinitionWithStatus
}

export type IntegrationsContextValue = {
  sectionManager: StackActionManager<Record<string, unknown>>
  popupManager: StackActionManager<Record<string, unknown>>
  integrations: IntegrationView[]
  openIntegrationConfig: (key: IntegrationKey, mode: IntegrationConfigMode, integrationId: number | null) => void
  removeIntegration: (key: IntegrationKey, integrationId: number | null) => void
}

export const IntegrationsContext = createContext<IntegrationsContextValue | null>(null)
