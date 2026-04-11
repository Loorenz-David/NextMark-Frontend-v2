import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { hasFormChanges, makeInitialFormCopy } from '@shared-domain'

import { LocalDeliveryEditFormContextProvider } from './LocalDeliveryEditForm.context'
import { useLocalDeliveryEditFormContextData } from './LocalDeliveryEditFormContextData'
import { useLocalDeliveryEditFormWarnings } from './LocalDeliveryEditForm.warnings'
import { useLocalDeliveryEditFormSetters } from './localDeliveryEditForm.setters'
import { useLocalDeliveryEditFormValidation } from './LocalDeliveryEditForm.validation'
import { useLocalDeliveryEditFormActions } from './localDeliveryEditForm.actions'
import { buildFormState, initialLocalDeliveryEditForm } from './localDeliveryEditForm.bootstrap'
import { useVehicleAvailabilityCheck } from '../../flows/useVehicleAvailabilityCheck.flow'

import type { LocalDeliveryEditFormState, PopupPayload } from './LocalDeliveryEditForm.types'

type ProviderProps = {
  children: ReactNode
  payload?: PopupPayload
  onSuccessClose?: () => void | Promise<void>
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}


export const LocalDeliveryEditFormProvider = ({
  children,
  payload,
  onSuccessClose,
  onUnsavedChangesChange,
}: ProviderProps) => {
  const [formState, setFormState] = useState<LocalDeliveryEditFormState>(initialLocalDeliveryEditForm())
  const initialFormRef = useRef<LocalDeliveryEditFormState | null>(null)

  const {
    localDeliveryPlanId,
    localDeliveryPlan,
    plan,
    selectedRouteSolution,
    routeSolutions,
  } = useLocalDeliveryEditFormContextData(payload)

  const formWarnings = useLocalDeliveryEditFormWarnings()
  const formSetters = useLocalDeliveryEditFormSetters({ setFormState, formWarnings })

  useVehicleAvailabilityCheck({ formState, formWarnings })

  const { validateForm } = useLocalDeliveryEditFormValidation({
    formWarnings,
    formState,
    initialFormRef,
  })

  const rawActions = useLocalDeliveryEditFormActions({
    formState,
    validateForm,
    initialFormRef,
  })

  const actions = {
    ...rawActions,
    handleSave: async (): Promise<boolean> => {
      const succeeded = await rawActions.handleSave()
      if (succeeded) {
        await onSuccessClose?.()
      }
      return succeeded
    },
    handleDelete: async (): Promise<boolean> => {
      const succeeded = await rawActions.handleDelete()
      if (succeeded) {
        await onSuccessClose?.()
      }
      return succeeded
    },
  }
  

  useEffect(() => {
    if (!localDeliveryPlanId) return
    setFormState((prev) => ({ ...prev, route_group_id: localDeliveryPlanId }))
  }, [localDeliveryPlanId])

  useEffect(() => {
    if (!localDeliveryPlanId || !localDeliveryPlan || !plan || !selectedRouteSolution) {
      return
    }

    setFormState((prev) => {
      const nextState = buildFormState(
        localDeliveryPlanId,
        plan,
        selectedRouteSolution,
        prev.create_variant_on_save,
      )
      makeInitialFormCopy(initialFormRef, nextState)
      return nextState
    })
  }, [localDeliveryPlanId, localDeliveryPlan, plan, selectedRouteSolution])

  const hasUnsavedChanges = hasFormChanges(formState, initialFormRef)

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onUnsavedChangesChange])

  const hasMultipleVariants = (routeSolutions?.length ?? 0) >= 1

  const value = {
    formState,
    formWarnings,
    hasMultipleVariants,
    hasUnsavedChanges,
    formSetters,
    actions,
  }

  return (
    <LocalDeliveryEditFormContextProvider value={value}>
      {children}
    </LocalDeliveryEditFormContextProvider>
  )
}
