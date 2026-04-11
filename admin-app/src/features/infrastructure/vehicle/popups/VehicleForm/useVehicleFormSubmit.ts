import { useCallback } from 'react'

import { useMessageHandler } from '@shared-message-handler'
import { getObjectDiff } from '@shared-utils'
import { hasFormChanges } from '@shared-domain'
import { buildClientId } from '@/lib/utils/clientId'

import { useCreateVehicle, useUpdateVehicle } from '../../api/vehicleApi'
import { buildVehicleCreateInput, buildVehicleUpdateFields } from '../../domain/vehicleForm.domain'
import { useVehicleByClientId } from '../../hooks/useVehicleSelectors'
import { useVehiclePopupController } from '../../hooks/useVehiclePopupController'
import { upsertVehicle } from '../../store/vehicleStore'
import type { VehicleUpdatePayload } from '../../types/vehicle'

import type { VehicleFormPayload, VehicleFormState } from './VehicleForm.types'

export const useVehicleFormSubmit = ({
  payload,
  formState,
  validateForm,
  initialFormRef,
}: {
  payload: VehicleFormPayload
  formState: VehicleFormState
  validateForm: () => boolean
  initialFormRef: React.RefObject<VehicleFormState | null>
}) => {
  const { showMessage } = useMessageHandler()
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const existing = useVehicleByClientId(payload.clientId ?? null)
  const { closeVehicleForm } = useVehiclePopupController()

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
        const clientId = existing?.client_id ?? buildClientId('vehicle')
        const createResult = buildVehicleCreateInput(clientId, formState)
        if (!createResult.ok) {
          showMessage({ status: 400, message: createResult.error })
          return
        }

        const response = await createVehicle(createResult.value)
        const persistedId = typeof response.data?.[clientId] === 'number' ? response.data[clientId] : undefined
        upsertVehicle({ ...createResult.value, ...(persistedId ? { id: persistedId as number } : {}) })
      } else {
        const targetId = existing?.id ?? existing?.client_id
        if (!targetId) {
          showMessage({ status: 400, message: 'Vehicle target is missing.' })
          return
        }

        const diff = getObjectDiff(initialForm, formState)
        const updateResult = buildVehicleUpdateFields(diff)
        if (!updateResult.ok) {
          showMessage({ status: 400, message: updateResult.error })
          return
        }

        const updatePayload: VehicleUpdatePayload = {
          target_id: targetId,
          fields: updateResult.value,
        }

        await updateVehicle(updatePayload)
        if (existing) {
          upsertVehicle({ ...existing, ...updatePayload.fields })
        }
      }

      closeVehicleForm()
    } catch (error) {
      console.error('Failed to save vehicle', error)
      showMessage({ status: 500, message: 'Unable to save vehicle.' })
    }
  }, [
    closeVehicleForm,
    createVehicle,
    existing,
    formState,
    initialFormRef,
    payload.mode,
    showMessage,
    updateVehicle,
    validateForm,
  ])

  return { handleSave }
}
