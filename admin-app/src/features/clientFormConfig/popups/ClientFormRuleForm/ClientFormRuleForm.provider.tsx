import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import { useClientFormRuleByClientId } from '../../store/clientFormConfig.selector'
import type { ClientFormRule } from '../../types/clientFormRule'
import { ClientFormRuleFormContextProvider } from './ClientFormRuleForm.context'
import type { ClientFormRuleFormPayload, ClientFormRuleFormState } from './ClientFormRuleForm.types'
import { useClientFormRuleFormValidation } from './ClientFormRuleForm.validation'
import { useClientFormRuleFormWarnings } from './ClientFormRuleForm.warnings'
import { useClientFormRuleFormSubmit } from './useClientFormRuleFormSubmit'

const buildInitialForm = (rule?: ClientFormRule | null): ClientFormRuleFormState => ({
  title: rule?.title ?? '',
  body: rule?.body ?? '',
  icon: rule?.icon ?? '',
  image_url: rule?.image_url ?? '',
  enabled: rule?.enabled ?? true,
})

export const ClientFormRuleFormProvider = ({
  children,
  payload,
}: {
  children: ReactNode
  payload: ClientFormRuleFormPayload
}) => {
  const existing = useClientFormRuleByClientId(payload.clientId ?? null)
  const [formState, setFormState] = useState<ClientFormRuleFormState>(() =>
    buildInitialForm(existing),
  )
  const initialFormRef = useRef<ClientFormRuleFormState | null>(null)
  const warnings = useClientFormRuleFormWarnings()

  useEffect(() => {
    const initial = buildInitialForm(existing)
    setFormState(initial)
    makeInitialFormCopy(initialFormRef, initial)
  }, [existing])

  const { validateForm } = useClientFormRuleFormValidation({ formState, warnings })
  const submitters = useClientFormRuleFormSubmit({
    payload,
    formState,
    validateForm,
    initialFormRef,
  })

  const value = useMemo(
    () => ({
      payload,
      formState,
      setFormState,
      initialFormRef,
      warnings,
      ...submitters,
    }),
    [formState, payload, submitters, warnings],
  )

  return <ClientFormRuleFormContextProvider value={value}>{children}</ClientFormRuleFormContextProvider>
}
