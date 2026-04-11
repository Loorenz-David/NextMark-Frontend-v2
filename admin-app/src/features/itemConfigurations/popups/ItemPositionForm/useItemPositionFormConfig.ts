import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { ItemPositionFormPayload, ItemPositionFormState } from './ItemPositionForm.types'

export const useItemPositionFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: ItemPositionFormState
  initialFormRef: RefObject<ItemPositionFormState | null>
  payload: ItemPositionFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create position' : 'Edit position' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
