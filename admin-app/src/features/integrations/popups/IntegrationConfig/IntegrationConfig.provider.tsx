import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { IntegrationConfigContextProvider } from './IntegrationConfig.context'
import type { InitialFormState, IntegrationConfigPayload } from './IntegrationConfig.types'
import { useIntegrationConfigValidation } from './IntegrationConfig.validation'
import { useIntegrationConfigLoader } from './useIntegrationConfigLoader'
import { useIntegrationConfigSubmit } from './useIntegrationConfigSubmit'
import { useIntegrationConfigSetters } from './useIntegrationConfigSetters'

const buildInitialForm = (): InitialFormState => ({
  shopify:{
    shop:''
  },
  email:{
    smtp_server: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    use_tls: true,
    use_ssl: false
  },
  twilio:{
    twilio_account_sid: '',
    twilio_api_key_sid: '',
    twilio_api_key_secret: '',
    sender_number: ''
  }
})

export const IntegrationConfigProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: IntegrationConfigPayload
}) => {
  const [formState, setFormState] = useState<InitialFormState>(buildInitialForm)
  const initialFormRef = useRef<InitialFormState | null>(null)

  useEffect(() => {
    const initial = buildInitialForm()
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [])

  const setters = useIntegrationConfigSetters({setFormState})
  const { validateForm } = useIntegrationConfigValidation()
  const submitters = useIntegrationConfigSubmit({ payload, validateForm, formState })
  useIntegrationConfigLoader({ payload, setFormState, initialFormRef })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      setters,
      ...submitters,
    }),
    [formState, payload, submitters],
  )

  return <IntegrationConfigContextProvider value={value}>{children}</IntegrationConfigContextProvider>
}
