import { useCallback } from 'react'

import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import {
  emitExternalFormRequest,
  type ExternalFormReceivedPayload,
} from '@/realtime/externalForm/externalForm.realtime'
import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'

import { useOrderFormFormSlice } from '../context/OrderFormForm.context'

export type OrderFormExternalFlow = {
  employeeUserId: number
  handleSendForm: () => void
}

export const useOrderFormExternalRealtimeFlow = ({
  mergeExternalClientData,
  referenceNumber,
  employeeUserId,
}: {
  mergeExternalClientData: (payload: ExternalFormReceivedPayload['form_data']) => void
  referenceNumber: string
  employeeUserId: number
}) => {
  const handleExternalFormReceived = useCallback(
    (payload: ExternalFormReceivedPayload) => {
      mergeExternalClientData(payload.form_data)
    },
    [mergeExternalClientData],
  )

  useExternalFormRealtime({
    userId: employeeUserId,
    onReceived: handleExternalFormReceived,
  })

  const handleSendForm = useCallback(() => {
    if (employeeUserId <= 0) {
      return
    }

    emitExternalFormRequest({
      user_id: employeeUserId,
      request_data: {
        reference_number: referenceNumber,
      },
    })
  }, [employeeUserId, referenceNumber])

  return {
    handleSendForm,
  }
}

export const useOrderFormExternalFlow = (): OrderFormExternalFlow => {
  const { formState, formSetters } = useOrderFormFormSlice()
  const session = sessionStorage.getSession()

  const employeeUserId = Number(
    session?.user?.id ?? (session as { userId?: string | number | null } | null)?.userId ?? -1,
  )

  const { handleSendForm } = useOrderFormExternalRealtimeFlow({
    mergeExternalClientData: formSetters.mergeExternalClientData,
    referenceNumber: formState.reference_number ?? '',
    employeeUserId,
  })

  return {
    employeeUserId,
    handleSendForm,
  }
}
