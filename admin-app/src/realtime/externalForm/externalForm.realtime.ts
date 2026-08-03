import type { ClientFormRoutePlanSchedule, ClientFormStep } from '@client-form-kit'
import type { ExternalFormData } from '@/features/externalForm/domain/externalForm.types'
import {
  createExternalFormChannel,
  type ExternalFormProgressPayload as SharedExternalFormProgressPayload,
} from '@shared-realtime'
import { adminRealtimeClient } from '../client'

export type ExternalFormSubmitPayload = {
  form_data: ExternalFormData
}

// What the till puts on the wire when it asks the counter device to open a
// form. The backend relays this verbatim (no whitelist, no enrichment), so the
// shape is owned end-to-end here: the till writes it, the device reads it.
export type ExternalFormRequestData = {
  reference_number?: string
  order_id?: number
  route_plan_schedule?: ClientFormRoutePlanSchedule | null
}

export type ExternalFormRequestPayload = {
  request_data?: ExternalFormRequestData
}

export type ExternalFormReceivedPayload = {
  form_data: ExternalFormData
  submitted_by: number
}

export type ExternalFormRequestedPayload = {
  request_data?: ExternalFormRequestData
  requested_by: number
}

// The publish side narrows `step` to the kit's step union (the package keeps
// it as a plain string because it must not depend on the form kit). The
// receive side deliberately does NOT narrow: the relay forwards the wire value
// opaquely, so consumers coerce it (`coerceClientFormStep`) before use.
export type ExternalFormProgressData = {
  form_data: ExternalFormData
  step: ClientFormStep
  seq: number
  session: string
}

export type ExternalFormProgressPublishPayload = {
  progress_data: ExternalFormProgressData
}

export type ExternalFormProgressPayload =
  SharedExternalFormProgressPayload<ExternalFormData>

const externalFormChannel = createExternalFormChannel<ExternalFormData>(adminRealtimeClient)
const receivedSubscriptions = new Map<
  (payload: ExternalFormReceivedPayload) => void,
  () => void
>()
const requestedSubscriptions = new Map<
  (payload: ExternalFormRequestedPayload) => void,
  () => void
>()
const progressSubscriptions = new Map<
  (payload: ExternalFormProgressPayload) => void,
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

export const emitExternalFormProgress = (payload: ExternalFormProgressPublishPayload) => {
  externalFormChannel.progress(payload)
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

export const subscribeToExternalFormProgress = (
  handler: (payload: ExternalFormProgressPayload) => void,
) => {
  const release = externalFormChannel.onProgress(handler)
  progressSubscriptions.set(handler, release)
  return release
}

export const unsubscribeFromExternalFormProgress = (
  handler: (payload: ExternalFormProgressPayload) => void,
) => {
  const release = progressSubscriptions.get(handler)
  if (!release) {
    return
  }

  progressSubscriptions.delete(handler)
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
