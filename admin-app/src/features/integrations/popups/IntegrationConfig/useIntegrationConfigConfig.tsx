import type {  RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { InitialFormState, IntegrationConfigPayload, IntegrationConfigSetters } from './IntegrationConfig.types'
import { ShopifyIntegrationForm } from './integrationForms/ShopifyIntegrationForm'
import { EmailIntegrationForm } from './integrationForms/EmailIntegrationForm'
import { TwilioIntegrationForm } from './integrationForms/TwilioIntegrationForm'







export const useIntegrationConfigConfig = ({
  formState,
  initialFormRef,
  payload,
  setters
}: {
  formState: InitialFormState
  initialFormRef: RefObject<InitialFormState | null>
  payload: IntegrationConfigPayload,
  setters: IntegrationConfigSetters
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    const label = payload.mode === 'create' ? 'Create' : 'Save'
    setPopupHeader({ label: `${label} integration` })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])

  const renderIntegrationForm = () =>{
    switch( payload.integrationKey ){
      case 'shopify':
        return (
            <ShopifyIntegrationForm
              formSetters={setters.shopify}
              formState={formState.shopify}
            />
          )
      case 'email':
        return ( 
          <EmailIntegrationForm
            formSetters={setters.email}
            formState={formState.email}
          />
        )
      case 'twilio':
        return(
          <TwilioIntegrationForm
            formSetters={setters.twilio}
            formState={formState.twilio}
          />
        )
      default:
        return null
    }
  }
  
  return { renderIntegrationForm }
}
