import { useCallback, useRef } from 'react'

import { sessionStorage } from '@/features/auth/login/store/sessionStorage'
import {
  emitExternalFormRequest,
  type ExternalFormReceivedPayload,
} from '@/realtime/externalForm/externalForm.realtime'
import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'

import { useOrderFormFormSlice } from '../context/OrderFormForm.context'
import {
  clearPendingLinkedDeviceForm,
  getPendingLinkedDeviceForm,
  registerPendingLinkedDeviceForm,
} from '../../../store/orderLinkedDeviceForm.store'
import { resolveLinkedDeviceSendDecision } from '../../../domain/orderLinkedDeviceForm.domain'

export type OrderFormLinkedDeviceSendTarget = {
  orderId: number
}

export type OrderFormLinkedDeviceSendResult =
  | { status: 'sent'; closeAfterSend: boolean }
  | { status: 'blocked'; message: string }
  | { status: 'error'; message: string }

export type OrderFormExternalFlow = {
  employeeUserId: number
  handleSendForm: (
    target?: OrderFormLinkedDeviceSendTarget | null,
  ) => OrderFormLinkedDeviceSendResult
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
  const awaitingDraftResponseRef = useRef(false)

  const handleExternalFormReceived = useCallback(
    (payload: ExternalFormReceivedPayload) => {
      if (!awaitingDraftResponseRef.current) {
        return
      }

      awaitingDraftResponseRef.current = false
      mergeExternalClientData(payload.form_data)
    },
    [mergeExternalClientData],
  )

  useExternalFormRealtime({
    onReceived: handleExternalFormReceived,
  })

  const handleSendForm = useCallback((
    target?: OrderFormLinkedDeviceSendTarget | null,
  ): OrderFormLinkedDeviceSendResult => {
    if (employeeUserId <= 0) {
      return { status: 'error', message: 'Linked device unavailable.' }
    }

    const pending = getPendingLinkedDeviceForm(employeeUserId)
    const decision = resolveLinkedDeviceSendDecision({
      pendingOrderId: pending?.orderId ?? null,
      targetOrderId: target?.orderId ?? null,
    })
    if (decision.status === 'blocked') {
      return {
        status: 'blocked',
        message: 'Another order is awaiting this linked device.',
      }
    }

    if (target) {
      registerPendingLinkedDeviceForm({
        employeeUserId,
        orderId: target.orderId,
      })
    } else {
      awaitingDraftResponseRef.current = true
    }

    try {
      emitExternalFormRequest({
        request_data: {
          reference_number: referenceNumber,
          order_id: target?.orderId,
        },
      })
    } catch {
      awaitingDraftResponseRef.current = false
      if (target) {
        clearPendingLinkedDeviceForm(employeeUserId)
      }
      return { status: 'error', message: 'Unable to contact linked device.' }
    }

    return { status: 'sent', closeAfterSend: decision.closeAfterSend }
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
