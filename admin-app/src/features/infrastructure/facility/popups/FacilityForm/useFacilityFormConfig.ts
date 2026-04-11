import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { FacilityFormPayload, FacilityFormState } from './FacilityForm.types'

export const useFacilityFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: FacilityFormState
  initialFormRef: RefObject<FacilityFormState | null>
  payload: FacilityFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create facility' : 'Edit facility' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [clearCloseGuard, formState, initialFormRef, registerCloseGuard])
}
