import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { hasFormChanges, makeInitialFormCopy } from '@shared-domain'

import { RouteGroupEditFormContextProvider } from './RouteGroupEditForm.context'
import { useRouteGroupEditFormContextData } from './RouteGroupEditFormContextData'
import { useRouteGroupEditFormWarnings } from './RouteGroupEditForm.warnings'
import { useRouteGroupEditFormSetters } from './routeGroupEditForm.setters'
import { useRouteGroupEditFormValidation } from './RouteGroupEditForm.validation'
import { useRouteGroupEditFormActions } from './routeGroupEditForm.actions'
import { buildFormState, initialRouteGroupEditForm } from './routeGroupEditForm.bootstrap'
import { useVehicleAvailabilityCheck } from '../../flows/useVehicleAvailabilityCheck.flow'
import { useRouteGroupDetailsFlow } from '../../flows/routeGroupDetails.flow'

import type { RouteGroupEditFormState, PopupPayload } from './RouteGroupEditForm.types'

type ProviderProps = {
  children: ReactNode
  payload?: PopupPayload
  onSuccessClose?: () => void | Promise<void>
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void
}


export const RouteGroupEditFormProvider = ({
  children,
  payload,
  onSuccessClose,
  onUnsavedChangesChange,
}: ProviderProps) => {
  const [formState, setFormState] = useState<RouteGroupEditFormState>(initialRouteGroupEditForm())
  const initialFormRef = useRef<RouteGroupEditFormState | null>(null)
  const requestedOverviewKeyRef = useRef<string | null>(null)
  const { fetchRouteGroupDetails } = useRouteGroupDetailsFlow()

  const {
    routeGroupId,
    routeGroup,
    plan,
    selectedRouteSolution,
    routeSolutions,
  } = useRouteGroupEditFormContextData(payload)
  const isNoZoneGroup = routeGroup?.zone_id == null

  const formWarnings = useRouteGroupEditFormWarnings()
  const formSetters = useRouteGroupEditFormSetters({
    setFormState,
    formWarnings,
    isNoZoneGroup,
  })

  useVehicleAvailabilityCheck({ formState, formWarnings })

  const { validateForm } = useRouteGroupEditFormValidation({
    formWarnings,
    formState,
    initialFormRef,
  })

  const rawActions = useRouteGroupEditFormActions({
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
    if (!routeGroupId) return
    setFormState((prev) => ({ ...prev, route_group_id: routeGroupId }))
  }, [routeGroupId])

  useEffect(() => {
    if (!routeGroupId || !routeGroup || !plan || !selectedRouteSolution) {
      return
    }

    setFormState((prev) => {
      const nextState = buildFormState(
        routeGroupId,
        plan,
        selectedRouteSolution,
        prev.create_variant_on_save,
      )
      makeInitialFormCopy(initialFormRef, nextState)
      return nextState
    })
  }, [routeGroupId, routeGroup, plan, selectedRouteSolution])

  useEffect(() => {
    if (!routeGroupId || !routeGroup || !plan) {
      requestedOverviewKeyRef.current = null
      return
    }

    if (selectedRouteSolution) {
      requestedOverviewKeyRef.current = null
      return
    }

    const requestKey = `${plan.id ?? routeGroup.route_plan_id ?? 'unknown'}:${routeGroupId}`
    if (requestedOverviewKeyRef.current === requestKey) {
      return
    }
    requestedOverviewKeyRef.current = requestKey

    void fetchRouteGroupDetails(
      plan.id ?? routeGroup.route_plan_id ?? routeGroupId,
      routeGroupId,
    )
  }, [
    fetchRouteGroupDetails,
    plan,
    routeGroup,
    routeGroupId,
    selectedRouteSolution,
  ])

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
    <RouteGroupEditFormContextProvider value={value}>
      {children}
    </RouteGroupEditFormContextProvider>
  )
}
