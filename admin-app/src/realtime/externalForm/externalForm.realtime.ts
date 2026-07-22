import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'
import { createExternalFormChannel } from '@shared-realtime'
import { adminRealtimeClient } from '../client'

export type ExternalFormSubmitPayload = {
  form_data: ExternalFormData
}

export type ExternalFormRequestPayload = {
  request_data?: Record<string, unknown>
}

export type ExternalFormReceivedPayload = {
  form_data: ExternalFormData
  submitted_by: number
}

export type ExternalFormRequestedPayload = {
  request_data?: Record<string, unknown>
  requested_by: number
}

const externalFormChannel = createExternalFormChannel<ExternalFormData>(adminRealtimeClient)
const receivedSubscriptions = new Map<
  (payload: ExternalFormReceivedPayload) => void,
  () => void
>()
const requestedSubscriptions = new Map<
  (payload: ExternalFormRequestedPayload) => void,
  () => void
>()

// The external-form room is team-scoped, so there is a single room per device.
// A simple reference count keeps one join alive across all mounted consumers.
let externalFormRoomReferenceCount = 0

export const joinExternalFormRoom = () => {
  externalFormRoomReferenceCount += 1
  if (externalFormRoomReferenceCount > 1) {
    return
  }

  externalFormChannel.join()
}

export const leaveExternalFormRoom = () => {
  if (externalFormRoomReferenceCount === 0) {
    return
  }

  externalFormRoomReferenceCount -= 1
  if (externalFormRoomReferenceCount > 0) {
    return
  }

  externalFormChannel.leave()
}

export const emitExternalFormSubmit = (payload: ExternalFormSubmitPayload) => {
  externalFormChannel.submit(payload)
}

export const emitExternalFormRequest = (payload: ExternalFormRequestPayload = {}) => {
  externalFormChannel.request(payload)
}

export const subscribeToExternalFormReceived = (
  handler: (payload: ExternalFormReceivedPayload) => void,
) => {
  const release = externalFormChannel.onReceived(handler)
  receivedSubscriptions.set(handler, release)
  return release
}

export const unsubscribeFromExternalFormReceived = (
  handler: (payload: ExternalFormReceivedPayload) => void,
) => {
  const release = receivedSubscriptions.get(handler)
  if (!release) {
    return
  }

  receivedSubscriptions.delete(handler)
  release()
}

export const subscribeToExternalFormRequested = (
  handler: (payload: ExternalFormRequestedPayload) => void,
) => {
  const release = externalFormChannel.onRequested(handler)
  requestedSubscriptions.set(handler, release)
  return release
}

export const unsubscribeFromExternalFormRequested = (
  handler: (payload: ExternalFormRequestedPayload) => void,
) => {
  const release = requestedSubscriptions.get(handler)
  if (!release) {
    return
  }

  requestedSubscriptions.delete(handler)
  release()
}
