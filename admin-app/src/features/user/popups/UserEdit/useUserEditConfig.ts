import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { UserEditFormState } from './UserEdit.types'

export const useUserEditConfig = ({
  formState,
  initialFormRef,
}: {
  formState: UserEditFormState
  initialFormRef: RefObject<UserEditFormState | null>
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: 'Edit profile' })
    return () => setPopupHeader(null)
  }, [setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [ formState, initialFormRef])
}
