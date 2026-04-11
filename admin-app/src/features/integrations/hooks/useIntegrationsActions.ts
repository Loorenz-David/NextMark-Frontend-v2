import { useCallback } from 'react'

import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { IntegrationKey } from '../types/integration'
import { useIntegrationsController } from './useIntegrationsController'


export type IntegrationConfigMode = 'create' | 'edit'

export const useIntegrationsActions = ({ onRemoved }: { onRemoved?: (key: IntegrationKey) => void } = {}) => {
  const popupManager = usePopupManager()
  const { deleteIntegration } = useIntegrationsController()


  const openIntegrationConfig = useCallback(
    (key: IntegrationKey, mode: IntegrationConfigMode, integrationId: number | null) => {
      popupManager.open({
        key: 'integrations.config',
        payload: { integrationKey: key, mode, integrationId },
      })
    },
    [popupManager],
  )

  const removeIntegration = useCallback(
    async (key: IntegrationKey, integrationId: number | null) => {
      const removed = await deleteIntegration(key, integrationId)
      if (removed) {
        onRemoved?.(key)
      }
    },
    [deleteIntegration, onRemoved],
  )

  return {
    openIntegrationConfig,
    removeIntegration,
  }
}
