import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMessageHandler } from '@shared-message-handler'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

import type { IntegrationKey } from '../types/integration'
import { integrationEmailApi } from '../api/integrationEmailApi'
import { integrationShopifyApi } from '../api/integrationShopifyApi'
import { integrationTwilioApi } from '../api/integrationTwilioApi'




export type IntegrationsPayload = {
  key : IntegrationKey
  form: any
  integrationId?: number | null
}

export const useIntegrationsController = () => {
  const popupManager = usePopupManager()
  const { showMessage } = useMessageHandler()
  const navigate = useNavigate()

  const saveIntegration = useCallback(
    async ({key, form}:IntegrationsPayload) => {

      if(key == 'shopify'){
        const shopifyForm = form.shopify
        if( !(shopifyForm.shop.trim().length > 0) ) return 
        const res = await integrationShopifyApi.connect(shopifyForm.shop.trim())
        const authUrl = res.data?.auth_url
        if (!authUrl) return

        window.location.href = authUrl
      }
      if (key === 'twilio') {
        const twilioForm = form.twilio ?? {}
        let isConnected = false
        try {
          await integrationTwilioApi.connect(twilioForm)
          isConnected = true
        } catch (error) {
          showMessage({ status: 'error', message: 'Failed to connect Twilio integration, please check your credentials.' })
          console.error('Failed to connect Twilio integration:', error)
          throw error
        }
        navigate(`/settings/integrations/status?integration=twilio&status=${isConnected ? 'connected' : 'failed'}`)
      }

      if (key === 'email') {
        const emailForm = form.email ?? {}
        let isConnected = false
        try {
          await integrationEmailApi.connect(emailForm)
          isConnected = true
        } catch (error) {
          showMessage({ status: 'error', message: 'Failed to connect email integration, please check your credentials.' })
          console.error('Failed to connect email integration:', error)
          throw error
        }
        navigate(`/settings/integrations/status?integration=email&status=${isConnected ? 'connected' : 'failed'}`)
      }

      popupManager.closeByKey('integrations.config')
      return true
    },
    [popupManager],
  )

  const getIntegrationDetails = useCallback(async (key: IntegrationKey, integrationId?: number | null) => {
    if (!integrationId) {
      return null
    }

    switch (key) {
      case 'shopify':
        return integrationShopifyApi.getDetails(integrationId)
      case 'twilio':
        return integrationTwilioApi.getDetails(integrationId)
      case 'email':
        return integrationEmailApi.getDetails(integrationId)
      default:
        return null
    }
  }, [])

  const updateIntegration = useCallback(async ({ key, form, integrationId }: IntegrationsPayload) => {
    if (!integrationId) {
      return null
    }

    switch (key) {
      case 'twilio':
        return integrationTwilioApi.update(integrationId, form.twilio ?? {})
      case 'email':
        return integrationEmailApi.update(integrationId, form.email ?? {})
      default:
        return null
    }
  }, [])

  const deleteIntegration = useCallback(async (key: IntegrationKey, integrationId: number | null) => {
    if (!integrationId) {
      showMessage({ status: 400, message: 'Missing integration id.' })
      return null
    }

    try {
      switch (key) {
        case 'shopify':
          await integrationShopifyApi.disconnect(integrationId)
          break
        case 'twilio':
          await integrationTwilioApi.disconnect(integrationId)
          break
        case 'email':
          await integrationEmailApi.disconnect(integrationId)
          break
        default:
          return null
      }

      showMessage({ status: 'success', message: 'Integration removed.' })
      return true
    } catch (error) {
      console.error('Failed to remove integration', error)
      showMessage({ status: 500, message: 'Unable to remove integration.' })
      return null
    }
  }, [showMessage])

  return { saveIntegration, getIntegrationDetails, updateIntegration, deleteIntegration }
}
