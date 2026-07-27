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
  diagnostic_trace_id?: string
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

const EXTERNAL_FORM_LOG_PREFIX = '[external-form-socket]'

const createDiagnosticTraceId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `external-form-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const logExternalFormSocket = (
  event: string,
  details: Record<string, unknown> = {},
) => {
  console.info(EXTERNAL_FORM_LOG_PREFIX, {
    at: new Date().toISOString(),
    event,
    ...details,
  })
}

const getTransportDetails = () => {
  const diagnostics = adminRealtimeClient.getDiagnostics().transport
  return {
    socket_state: diagnostics.state,
    reconnect_attempt: diagnostics.reconnectAttempt,
    last_error: diagnostics.lastError,
  }
}

let releaseDiagnostics: (() => void) | null = null
let lastDiagnosticsSignature = ''

const startExternalFormDiagnostics = () => {
  if (releaseDiagnostics) {
    return
  }

  releaseDiagnostics = adminRealtimeClient.onDiagnosticsChange((diagnostics) => {
    const signature = JSON.stringify(diagnostics.transport)
    if (signature === lastDiagnosticsSignature) {
      return
    }

    lastDiagnosticsSignature = signature
    logExternalFormSocket('connection_state_changed', {
      ...getTransportDetails(),
      last_connected_at: diagnostics.transport.lastConnectedAt
        ? new Date(diagnostics.transport.lastConnectedAt).toISOString()
        : null,
      last_disconnected_at: diagnostics.transport.lastDisconnectedAt
        ? new Date(diagnostics.transport.lastDisconnectedAt).toISOString()
        : null,
    })
  })
}

const stopExternalFormDiagnostics = () => {
  releaseDiagnostics?.()
  releaseDiagnostics = null
  lastDiagnosticsSignature = ''
}

// The external-form room is team-scoped, so there is a single room per device.
// A simple reference count keeps one join alive across all mounted consumers.
let externalFormRoomReferenceCount = 0

export const joinExternalFormRoom = () => {
  externalFormRoomReferenceCount += 1
  logExternalFormSocket('room_join_requested', {
    room_consumers: externalFormRoomReferenceCount,
    ...getTransportDetails(),
  })
  if (externalFormRoomReferenceCount > 1) {
    return
  }

  startExternalFormDiagnostics()
  externalFormChannel.join()
}

export const leaveExternalFormRoom = () => {
  if (externalFormRoomReferenceCount === 0) {
    logExternalFormSocket('room_leave_ignored', {
      reason: 'no_registered_consumers',
      ...getTransportDetails(),
    })
    return
  }

  externalFormRoomReferenceCount -= 1
  logExternalFormSocket('room_leave_requested', {
    room_consumers: externalFormRoomReferenceCount,
    ...getTransportDetails(),
  })
  if (externalFormRoomReferenceCount > 0) {
    return
  }

  externalFormChannel.leave()
  stopExternalFormDiagnostics()
}

export const emitExternalFormSubmit = (payload: ExternalFormSubmitPayload) => {
  const connected = adminRealtimeClient.isConnected()
  logExternalFormSocket('submit_dispatch', {
    delivery: connected ? 'emitted' : 'queued_for_reconnect',
    ...getTransportDetails(),
  })
  externalFormChannel.submit(payload)
}

export const emitExternalFormRequest = (payload: ExternalFormRequestPayload = {}) => {
  const diagnosticTraceId =
    payload.request_data?.diagnostic_trace_id ?? createDiagnosticTraceId()
  const connected = adminRealtimeClient.isConnected()
  const tracedPayload: ExternalFormRequestPayload = {
    ...payload,
    request_data: {
      ...payload.request_data,
      diagnostic_trace_id: diagnosticTraceId,
    },
  }

  logExternalFormSocket('request_dispatch', {
    trace_id: diagnosticTraceId,
    order_id: payload.request_data?.order_id ?? null,
    has_route_plan_schedule: Boolean(payload.request_data?.route_plan_schedule),
    delivery: connected ? 'emitted' : 'queued_for_reconnect',
    ...getTransportDetails(),
  })
  externalFormChannel.request(tracedPayload)
}

export const emitExternalFormProgress = (payload: ExternalFormProgressPublishPayload) => {
  logExternalFormSocket('progress_dispatch', {
    session: payload.progress_data.session,
    seq: payload.progress_data.seq,
    step: payload.progress_data.step,
    delivery: adminRealtimeClient.isConnected() ? 'emitted' : 'best_effort_dropped',
    ...getTransportDetails(),
  })
  externalFormChannel.progress(payload)
}

export const subscribeToExternalFormReceived = (
  handler: (payload: ExternalFormReceivedPayload) => void,
) => {
  const handleReceived = (payload: ExternalFormReceivedPayload) => {
    logExternalFormSocket('submit_received', {
      submitted_by: payload.submitted_by,
      ...getTransportDetails(),
    })
    handler(payload)
  }
  const release = externalFormChannel.onReceived(handleReceived)
  receivedSubscriptions.set(handler, release)
  logExternalFormSocket('submit_listener_added', {
    listeners: receivedSubscriptions.size,
    ...getTransportDetails(),
  })
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
  logExternalFormSocket('submit_listener_removed', {
    listeners: receivedSubscriptions.size,
    ...getTransportDetails(),
  })
}

export const subscribeToExternalFormProgress = (
  handler: (payload: ExternalFormProgressPayload) => void,
) => {
  const handleProgress = (payload: ExternalFormProgressPayload) => {
    logExternalFormSocket('progress_received', {
      progressed_by: payload.progressed_by,
      session: payload.progress_data.session,
      seq: payload.progress_data.seq,
      step: payload.progress_data.step,
      ...getTransportDetails(),
    })
    handler(payload)
  }
  const release = externalFormChannel.onProgress(handleProgress)
  progressSubscriptions.set(handler, release)
  logExternalFormSocket('progress_listener_added', {
    listeners: progressSubscriptions.size,
    ...getTransportDetails(),
  })
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
  logExternalFormSocket('progress_listener_removed', {
    listeners: progressSubscriptions.size,
    ...getTransportDetails(),
  })
}

export const subscribeToExternalFormRequested = (
  handler: (payload: ExternalFormRequestedPayload) => void,
) => {
  const handleRequested = (payload: ExternalFormRequestedPayload) => {
    logExternalFormSocket('request_received', {
      trace_id: payload.request_data?.diagnostic_trace_id ?? null,
      order_id: payload.request_data?.order_id ?? null,
      requested_by: payload.requested_by,
      ...getTransportDetails(),
    })
    handler(payload)
  }
  const release = externalFormChannel.onRequested(handleRequested)
  requestedSubscriptions.set(handler, release)
  logExternalFormSocket('request_listener_added', {
    listeners: requestedSubscriptions.size,
    ...getTransportDetails(),
  })
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
  logExternalFormSocket('request_listener_removed', {
    listeners: requestedSubscriptions.size,
    ...getTransportDetails(),
  })
}
