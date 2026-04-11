import type { EmailSMTPState } from '../../types/emailIntegration'
import type { IntegrationKey } from '../../types/integration'
import type { ShopifyIntegrationFormState } from '../../types/shopifyIntegration'
import type { TwilioModState } from '../../types/twilioIntegration'

export type IntegrationConfigPayload = {
  integrationKey: IntegrationKey
  mode: 'create' | 'edit'
  integrationId: number | null
}



export type InitialFormState = {
  shopify:ShopifyIntegrationFormState
  email:EmailSMTPState
  twilio:TwilioModState
}

export type IntegrationConfigSetters = {
  shopify: {
    handleShopInput: (value: string) => void
  }
  twilio:{
    handleTwilioKeyInput: (value: string, field: keyof TwilioModState) => void
  }
  email:{
    handleEmailKeyInput: (value: string | boolean, field: keyof EmailSMTPState) => void
  }
}

export type IntegrationConfigFormState = Record<string, never>
