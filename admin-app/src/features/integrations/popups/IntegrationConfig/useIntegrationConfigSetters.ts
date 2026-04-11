import type { Dispatch, SetStateAction } from 'react'

import type { InitialFormState, IntegrationConfigSetters } from './IntegrationConfig.types'

export const useIntegrationConfigSetters = ({
  setFormState,
}: {
  setFormState: Dispatch<SetStateAction<InitialFormState>>
}): IntegrationConfigSetters => {
  const handleShopInput = (value:string) => {
    setFormState((prev) => ({
      ...prev,
      shopify:{
        ...prev.shopify,
        shop: value
      }
    }))
  }

  const handleEmailKeyInput = (value:string | boolean, field: keyof InitialFormState['email']) => {

    setFormState((prev) => ({
      ...prev,
      email:{
        ...prev.email,
        [field]: value
      }
    }))
  }

  const handleTwilioKeyInput = (value:string, field: keyof InitialFormState['twilio']) => {

    setFormState((prev) => ({
      ...prev,
      twilio:{
        ...prev.twilio,
        [field]: value
      }
    }))
  }


  



  return { 
    shopify:{
      handleShopInput
    },
    twilio:{
      handleTwilioKeyInput
    },
    email:{
      handleEmailKeyInput
    }
   }
}
