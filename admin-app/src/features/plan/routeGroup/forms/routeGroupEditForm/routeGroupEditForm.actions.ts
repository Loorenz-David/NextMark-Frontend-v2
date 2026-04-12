import { useCallback } from 'react'
import type { RefObject } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { makeInitialFormCopy } from '@shared-domain'
import {
  useRouteGroupDeleteMutations,
  useRouteGroupSettingsMutations,
} from '@/features/plan/routeGroup/controllers/routeGroupSettings.controller'
import { useBaseControlls, useSectionManager } from '@/shared/resource-manager/useResourceManager'

import type { RouteGroupEditFormState } from './RouteGroupEditForm.types'

type Props = {
  formState: RouteGroupEditFormState
  validateForm: () => boolean
  initialFormRef: RefObject<RouteGroupEditFormState | null>
}

export const useRouteGroupEditFormActions = ({
  formState,
  validateForm,
  initialFormRef,
}: Props) => {
  const { showMessage } = useMessageHandler()
  const { updateRouteGroupSettings } = useRouteGroupSettingsMutations()
  const { deleteRouteGroup } = useRouteGroupDeleteMutations()
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

    const result = await updateRouteGroupSettings(formState)

    if (result) {
      makeInitialFormCopy(initialFormRef, formState)
      return true
    }
    return false
  }, [formState, validateForm, showMessage, initialFormRef, updateRouteGroupSettings])

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!formState.delivery_plan.id) {
      showMessage({ message: 'Delivery plan id is missing.', status: 'warning' })
      return false
    }
    if (!formState.route_group_id) {
      showMessage({ message: 'Route group id is missing.', status: 'warning' })
      return false
    }

    const result = await deleteRouteGroup({
      planId: formState.delivery_plan.id,
      routeGroupId: formState.route_group_id,
    })

    if (result.success && result.deletedPlan) {
      sectionManager.closeByKey('RouteGroupsPage')
      baseControlls.closeBase()
      return true
    }

    if (result.success) {
      return true
    }
    return false
  }, [baseControlls, deleteRouteGroup, formState, sectionManager, showMessage])

  return {
    handleSave,
    handleDelete,
  }
}
