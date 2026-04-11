import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { InviteMemberFormState } from './InviteMember.types'

export const useInviteMemberConfig = ({
  formState,
  initialFormRef,
}: {
  formState: InviteMemberFormState
  initialFormRef: RefObject<InviteMemberFormState | null>
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: 'Invite member' })
    return () => setPopupHeader(null)
  }, [setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
