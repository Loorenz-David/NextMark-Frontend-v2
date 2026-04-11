import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useMobile } from '@/app/contexts/MobileContext'
import { hasFormChanges } from '@shared-domain'

import { useCostumerByClientId } from '../../../store/costumer.selectors'
import { useCostumerFormActions } from '../controllers/useCostumerFormSubmit.controller'
import { CostumerFormContextProvider } from '../context/CostumerForm.context'
import { useCostumerFormBootstrapState } from './useCostumerFormBootstrapState'
import { useCostumerFormCloseController } from './useCostumerFormCloseController'
import type { CostumerFormPayload, CostumerFormSubmitOptions } from '../state/CostumerForm.types'
import { useCostumerFormValidation } from '../state/CostumerForm.validation'
import { useCostumerFormWarnings } from '../state/CostumerForm.warnings'
import { useCostumerFormSetters } from '../state/costumerForm.setters'

export const CostumerFormProvider = ({
  payload,
  onClose,
  submitOptions,
  children,
}: {
  payload?: CostumerFormPayload
  onClose?: () => void
  submitOptions?: CostumerFormSubmitOptions
  children: ReactNode
}) => {
  const { isMobile } = useMobile()

  const mode = payload?.mode ?? 'create'
  const costumer = useCostumerByClientId(payload?.clientId ?? null)

  const { formState, setFormState, initialFormRef } = useCostumerFormBootstrapState({
    mode,
    payloadClientId: payload?.clientId,
    costumer,
  })

  const warnings = useCostumerFormWarnings()
  const formSetters = useCostumerFormSetters({
    setFormState,
    warnings,
  })

  const { validateForm } = useCostumerFormValidation({
    formState,
    warnings,
  })

  const actions = useCostumerFormActions({
    mode,
    costumer,
    formState,
    validateForm,
    initialFormRef,
    submitOptions,
  })

  const hasUnsavedChanges = useMemo(() => hasFormChanges(formState, initialFormRef), [formState, initialFormRef])

  const closeController = useCostumerFormCloseController({
    isMobile,
    hasUnsavedChanges,
    onClose,
  })

  const value = useMemo(
    () => ({
      formState,
      setFormState,
      warnings,
      formSetters,
      actions,
      meta: {
        mode,
        costumer,
        initialFormRef,
      },
      closeController,
    }),
    [actions, closeController, costumer, formSetters, formState, initialFormRef, mode, warnings],
  )

  return <CostumerFormContextProvider value={value}>{children}</CostumerFormContextProvider>
}
