import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'
import { createExternalFormChannel } from '@shared-realtime'
import { adminRealtimeClient } from '../client'

export type ExternalFormSubmitPayload = {
  user_id: number
  form_data: ExternalFormData
}

export type ExternalFormRequestPayload = {
  user_id: number
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

export const joinExternalFormUserRoom = (userId: number) => {
  externalFormChannel.joinUser(userId)
}

export const leaveExternalFormUserRoom = (userId: number) => {
  externalFormChannel.leaveUser(userId)
}

export const emitExternalFormSubmit = (payload: ExternalFormSubmitPayload) => {
  externalFormChannel.submitUser(payload)
}

export const emitExternalFormRequest = (payload: ExternalFormRequestPayload) => {
  externalFormChannel.requestUser(payload)
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
