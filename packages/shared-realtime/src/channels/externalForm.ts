import {
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
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
  join: () => {
    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormJoinUser, {})
  },
  leave: () => {
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
  onReceived: (handler: (payload: ExternalFormReceivedPayload<TFormData>) => void) =>
    client.on<ExternalFormReceivedPayload<TFormData>>(REALTIME_SERVER_EVENTS.externalFormReceived, handler),
  onRequested: (handler: (payload: ExternalFormRequestedPayload) => void) =>
    client.on<ExternalFormRequestedPayload>(REALTIME_SERVER_EVENTS.externalFormRequested, handler),
})
