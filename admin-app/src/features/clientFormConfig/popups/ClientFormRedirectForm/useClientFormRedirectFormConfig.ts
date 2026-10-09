import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type {
  ClientFormRedirectFormPayload,
  ClientFormRedirectFormState,
} from './ClientFormRedirectForm.types'

export const useClientFormRedirectFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: ClientFormRedirectFormState
  initialFormRef: RefObject<ClientFormRedirectFormState | null>
  payload: ClientFormRedirectFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({
      label: payload.mode === 'create' ? 'Add redirect page' : 'Edit redirect page',
    })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
