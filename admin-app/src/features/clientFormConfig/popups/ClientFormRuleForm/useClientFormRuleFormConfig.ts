import type { RefObject } from 'react'
import { useEffect } from 'react'

import { hasFormChanges } from '@shared-domain'
import { usePopupContext } from '@/shared/popups/MainPopup/PopupContext'

import type { ClientFormRuleFormPayload, ClientFormRuleFormState } from './ClientFormRuleForm.types'

export const useClientFormRuleFormConfig = ({
  formState,
  initialFormRef,
  payload,
}: {
  formState: ClientFormRuleFormState
  initialFormRef: RefObject<ClientFormRuleFormState | null>
  payload: ClientFormRuleFormPayload
}) => {
  const { setPopupHeader, registerCloseGuard, clearCloseGuard } = usePopupContext()

  useEffect(() => {
    setPopupHeader({ label: payload.mode === 'create' ? 'Create rule' : 'Edit rule' })
    return () => setPopupHeader(null)
  }, [payload.mode, setPopupHeader])

  useEffect(() => {
    registerCloseGuard(() => !hasFormChanges(formState, initialFormRef))
    return () => clearCloseGuard()
  }, [formState, initialFormRef])
}
