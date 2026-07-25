import {
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  type ExternalFormProgressPayload,
  type ExternalFormProgressPublishPayload,
  type ExternalFormReceivedPayload,
  type ExternalFormRequestPayload,
  type ExternalFormRequestedPayload,
  type ExternalFormSubmitPayload,
} from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

// The external-form channel is team-scoped: the backend joins the socket to
// `external_form:{team_id}` using the authenticated claims, ignoring any payload
// user_id. So join/leave/submit/request carry no user id — the same team device
// pairing survives trusted-device user switching. (Event names are unchanged.)
export const createExternalFormChannel = <TFormData>(client: SharedRealtimeClient) => ({
  // Registered as a rejoin so the socket re-enters the room after any transient
  // drop. A plain publish would be sent once and lost on reconnect, silently
  // ejecting the device from the room while the connection still looked healthy.
  join: () => {
    client.registerRejoin(REALTIME_CLIENT_EVENTS.externalFormJoinUser, {})
  },
  leave: () => {
    client.unregisterRejoin(REALTIME_CLIENT_EVENTS.externalFormJoinUser)
    client.publish(REALTIME_CLIENT_EVENTS.externalFormLeaveUser, {})
  },
  submit: (payload: ExternalFormSubmitPayload<TFormData>) => {
    if (!payload.form_data) {
      return
    }

    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormSubmitUser, payload)
  },
  request: (payload: ExternalFormRequestPayload = {}) => {
    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormRequestUser, payload)
  },
  // Fire-and-forget snapshot; deliberately not a rejoin — a frame lost across a
  // reconnect is replaced by the next one.
  progress: (payload: ExternalFormProgressPublishPayload<TFormData>) => {
    if (!payload.progress_data) {
      return
    }

    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormProgressUser, payload)
  },
  onReceived: (handler: (payload: ExternalFormReceivedPayload<TFormData>) => void) =>
    client.on<ExternalFormReceivedPayload<TFormData>>(REALTIME_SERVER_EVENTS.externalFormReceived, handler),
  onRequested: (handler: (payload: ExternalFormRequestedPayload) => void) =>
    client.on<ExternalFormRequestedPayload>(REALTIME_SERVER_EVENTS.externalFormRequested, handler),
  onProgress: (handler: (payload: ExternalFormProgressPayload<TFormData>) => void) =>
    client.on<ExternalFormProgressPayload<TFormData>>(REALTIME_SERVER_EVENTS.externalFormProgress, handler),
})
