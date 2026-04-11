import { useCallback } from 'react'
import type { RefObject } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { makeInitialFormCopy } from '@shared-domain'
import { useLocalDeliveryPlanSettingsMutations } from '@/features/local-delivery-orders/controllers/localDeliveryPlanSettings.controller'
import { usePlanController } from '@/features/plan/controllers/plan.controller'
import { useBaseControlls, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import type { LocalDeliveryEditFormState } from './LocalDeliveryEditForm.types'

type Props = {
  formState: LocalDeliveryEditFormState
  validateForm: () => boolean
  initialFormRef: RefObject<LocalDeliveryEditFormState | null>
}

export const useLocalDeliveryEditFormActions = ({
  formState,
  validateForm,
  initialFormRef,
}: Props) => {
  const { showMessage } = useMessageHandler()
  const { updateLocalDeliverySettings } = useLocalDeliveryPlanSettingsMutations()
  const { deletePlan } = usePlanController()
  const sectionManager = useSectionManager()
  const  baseControlls = useBaseControlls()
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      showMessage({ message: 'Invalid form, check required fields.', status: 'warning' })
      return false
    }
    if (!formState.route_group_id) {
      showMessage({ message: 'Local delivery plan id is missing.', status: 'warning' })
      return false
    }
    if (!formState.route_solution.id) {
      showMessage({ message: 'Route solution id is missing.', status: 'warning' })
      return false
    }

    const result = await updateLocalDeliverySettings(formState)

    if (result) {
      makeInitialFormCopy(initialFormRef, formState)
      return true
    }
    return false
  }, [formState, validateForm, showMessage, initialFormRef, updateLocalDeliverySettings])

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!formState.delivery_plan.id) {
      showMessage({ message: 'Delivery plan id is missing.', status: 'warning' })
      return false
    }

    const result = await deletePlan(formState.delivery_plan.id)

    if (result) {
      sectionManager.closeByKey('RouteGroupsPage')
      baseControlls.closeBase()
      return true
    }
    return false
  }, [baseControlls, deletePlan, formState, sectionManager, showMessage])

  return {
    handleSave,
    handleDelete,
  }
}
