import { useEffect } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useIntegrationsController } from '../../hooks/useIntegrationsController'
import type { InitialFormState, IntegrationConfigPayload } from './IntegrationConfig.types'

export const useIntegrationConfigLoader = ({
  payload,
  setFormState,
  initialFormRef,
}: {
  payload: IntegrationConfigPayload
  setFormState: React.Dispatch<React.SetStateAction<InitialFormState>>
  initialFormRef: React.RefObject<InitialFormState | null>
}) => {
  const { getIntegrationDetails } = useIntegrationsController()

  useEffect(() => {
    if (payload.mode !== 'edit') {
      return
    }
    if (!payload.integrationId) {
      return
    }

    let isMounted = true

    const loadIntegration = async () => {
      try {
        const response = await getIntegrationDetails(payload.integrationKey, payload.integrationId)
        if (!response || !isMounted) {
          return
        }

        setFormState((prev) => {
          let next = prev
          if (payload.integrationKey === 'shopify') {
            const shopifyData =
              response.data && typeof response.data === 'object' && 'shopify' in response.data
                ? (response.data as { shopify?: { shop?: string | null } }).shopify
                : undefined
            const shop = shopifyData?.shop ?? prev.shopify.shop ?? ''
            next = {
              ...prev,
              shopify: {
                ...prev.shopify,
                shop,
              },
            }
          }

          makeInitialFormCopy(initialFormRef, next)
          return next
        })
      } catch (error) {
        console.error('Failed to load integration details', error)
      }
    }

    void loadIntegration()

    return () => {
      isMounted = false
    }
  }, [getIntegrationDetails, initialFormRef, payload.integrationId, payload.integrationKey, payload.mode, setFormState])
}
