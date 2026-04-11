import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { VehicleFormPayload, VehicleFormState } from './VehicleForm.types'

export const useVehicleFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: VehicleFormState
  initialFormRef: RefObject<VehicleFormState | null>
  payload: VehicleFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create vehicle' : 'Edit vehicle' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [clearCloseGuard, formState, initialFormRef, registerCloseGuard])
}
