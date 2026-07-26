import { useCallback, useEffect, useRef } from 'react'

import {
  emitExternalFormRequest,
  type ExternalFormReceivedPayload,
} from '@/realtime/externalForm/externalForm.realtime'
import { useExternalFormRealtime } from '@/realtime/externalForm/useExternalFormRealtime'

import { useOrderFormFormSlice } from '../context/OrderFormForm.context'
import { getLinkedDeviceEmployeeUserId } from '../../../flows/linkedDeviceEmployeeUser.flow'
import { getPendingLinkedDeviceForm } from '../../../store/orderLinkedDeviceForm.store'
import {
  clearLinkedDeviceLiveProgress,
  useOrderLinkedDeviceLiveProgressStore,
} from '../../../store/orderLinkedDeviceLiveProgress.store'
import { selectOrderByClientId, useOrderStore } from '../../../store/order.store'
import { resolveLinkedDeviceSendDecision } from '../../../domain/orderLinkedDeviceForm.domain'
import { shouldMergeLiveProgressIntoOrderForm } from '../../../domain/orderLinkedDeviceLiveProgress.domain'
import { requestOrderClientFormOnLinkedDevice } from '../../../flows/requestOrderClientFormOnLinkedDevice.flow'
import { resolveOrderRoutePlanSchedule } from '../../../flows/resolveOrderRoutePlanSchedule.flow'

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
  clientId,
}: {
  mergeExternalClientData: (payload: ExternalFormReceivedPayload['form_data']) => void
  referenceNumber: string
  employeeUserId: number
  clientId: string | null
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

  // Live preview: the background flow writes every progress frame into the
  // live-progress store; this form merges the frames that are its own — the
  // fill targeting the order it edits, or a draft fill it armed itself.
  // Watching the store (instead of the socket) gives mount-time catch-up: a
  // form opened mid-fill shows the current answers immediately, without the
  // unsaved customer input ever touching the order store.
  const formOrderServerId = useOrderStore(
    (state) => selectOrderByClientId(clientId)(state)?.id ?? null,
  )
  const liveEntry = useOrderLinkedDeviceLiveProgressStore(
    (state) => state.entryByEmployeeUserId[employeeUserId] ?? null,
  )
  const lastMergedRef = useRef<{ session: string; seq: number } | null>(null)

  useEffect(() => {
    if (
      !liveEntry ||
      !shouldMergeLiveProgressIntoOrderForm({
        entry: liveEntry,
        formOrderServerId,
        isAwaitingDraft: awaitingDraftResponseRef.current,
      })
    ) {
      return
    }

    const lastMerged = lastMergedRef.current
    if (
      lastMerged &&
      lastMerged.session === liveEntry.session &&
      lastMerged.seq >= liveEntry.seq
    ) {
      return
    }

    lastMergedRef.current = { session: liveEntry.session, seq: liveEntry.seq }
    mergeExternalClientData(liveEntry.formData)
  }, [liveEntry, formOrderServerId, mergeExternalClientData])

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

    lastMergedRef.current = null

    if (target) {
      const result = requestOrderClientFormOnLinkedDevice({
        employeeUserId,
        orderId: target.orderId,
        referenceNumber,
      })
      if (result.status !== 'sent') {
        return result
      }
      return { status: 'sent', closeAfterSend: true }
    }

    // Draft requests are local to the open order form. Persisted-order
    // requests use the reusable flow above so other entrypoints get the same
    // pending/live tracking behavior.
    clearLinkedDeviceLiveProgress(employeeUserId)
    awaitingDraftResponseRef.current = true

    try {
      emitExternalFormRequest({
        request_data: {
          reference_number: referenceNumber,
          route_plan_schedule: resolveOrderRoutePlanSchedule(formOrderServerId),
        },
      })
    } catch {
      awaitingDraftResponseRef.current = false
      return { status: 'error', message: 'Unable to contact linked device.' }
    }

    return { status: 'sent', closeAfterSend: decision.closeAfterSend }
  }, [employeeUserId, referenceNumber, formOrderServerId])

  return {
    handleSendForm,
  }
}

export const useOrderFormExternalFlow = (): OrderFormExternalFlow => {
  const { formState, formSetters } = useOrderFormFormSlice()
  const employeeUserId = getLinkedDeviceEmployeeUserId()

  const { handleSendForm } = useOrderFormExternalRealtimeFlow({
    mergeExternalClientData: formSetters.mergeExternalClientData,
    referenceNumber: formState.reference_number ?? '',
    employeeUserId,
    clientId: formState.client_id ?? null,
  })

  return {
    employeeUserId,
    handleSendForm,
  }
}
