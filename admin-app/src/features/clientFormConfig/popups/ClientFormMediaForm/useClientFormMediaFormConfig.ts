import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type {
  ClientFormMediaFormPayload,
  ClientFormMediaFormState,
} from './ClientFormMediaForm.types'

export const useClientFormMediaFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: ClientFormMediaFormState
  initialFormRef: RefObject<ClientFormMediaFormState | null>
  payload: ClientFormMediaFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Add image' : 'Edit image' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
