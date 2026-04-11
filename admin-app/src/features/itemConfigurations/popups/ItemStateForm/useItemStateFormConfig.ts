import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { ItemStateFormPayload, ItemStateFormState } from './ItemStateForm.types'

export const useItemStateFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: ItemStateFormState
  initialFormRef: RefObject<ItemStateFormState | null>
  payload: ItemStateFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create state' : 'Edit state' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
