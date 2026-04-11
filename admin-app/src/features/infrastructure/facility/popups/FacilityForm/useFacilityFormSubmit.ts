import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateFacility, useUpdateFacility } from '../../api/facilityApi'
import { buildFacilityCreateInput, buildFacilityUpdateFields } from '../../domain/facilityForm.domain'
import { useFacilityByClientId } from '../../hooks/useFacilitySelectors'
import { useFacilityPopupController } from '../../hooks/useFacilityPopupController'
import { upsertFacility } from '../../store/facilityStore'
import type { FacilityUpdatePayload } from '../../types/facility'

import type { FacilityFormPayload, FacilityFormState } from './FacilityForm.types'

export const useFacilityFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: FacilityFormPayload
  formState: FacilityFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<FacilityFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createFacility = useCreateFacility()
  const updateFacility = useUpdateFacility()
  const existing = useFacilityByClientId(payload.clientId ?? null)
  const { closeFacilityForm } = useFacilityPopupController()

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      showMessage({ status: 400, message: 'Please fix the highlighted fields.' })
      return
    }

    if (!hasFormChanges(formState, initialFormRef)) {
      showMessage({ status: 400, message: 'No changes to save.' })
      return
    }

    const initialForm = initialFormRef.current
    if (!initialForm) {
      showMessage({ status: 400, message: 'Missing initial form snapshot.' })
      return
    }

    try {
      if (payload.mode === 'create') {
        const clientId = existing?.client_id ?? buildClientId('facility')
        const createResult = buildFacilityCreateInput(clientId, formState)

        if (!createResult.ok) {
          showMessage({ status: 400, message: createResult.error })
          return
        }

        const response = await createFacility(createResult.value)
        const persistedId = typeof response.data?.[clientId] === 'number' ? response.data[clientId] : undefined
        upsertFacility({ ...createResult.value, ...(persistedId ? { id: persistedId as number } : {}) })
      } else {
        const targetId = existing?.id ?? existing?.client_id
        if (!targetId) {
          showMessage({ status: 400, message: 'Facility target is missing.' })
          return
        }

        const diff = getObjectDiff(initialForm, formState)
        const updateResult = buildFacilityUpdateFields(diff)

        if (!updateResult.ok) {
          showMessage({ status: 400, message: updateResult.error })
          return
        }

        const updatePayload: FacilityUpdatePayload = {
          target_id: targetId,
          fields: updateResult.value,
        }

        await updateFacility(updatePayload)
        if (existing) {
          upsertFacility({ ...existing, ...updatePayload.fields })
        }
      }

      closeFacilityForm()
    } catch (error) {
      console.error('Failed to save facility', error)
      showMessage({ status: 500, message: 'Unable to save facility.' })
    }
  }, [
    closeFacilityForm,
    createFacility,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateFacility,
    validateForm,
  ])

  return { handleSave }
}
