import {
  REALTIME_CLIENT_EVENTS,
  REALTIME_SERVER_EVENTS,
  type ExternalFormReceivedPayload,
  type ExternalFormRequestPayload,
  type ExternalFormRequestedPayload,
  type ExternalFormSubmitPayload,
} from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

export const createExternalFormChannel = <TFormData>(client: SharedRealtimeClient) => ({
  joinUser: (userId: number) => {
    if (!Number.isFinite(userId) || userId <= 0) {
      return
    }

    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormJoinUser, { user_id: userId })
  },
  leaveUser: (userId: number) => {
    if (!Number.isFinite(userId) || userId <= 0) {
      return
    }

    client.publish(REALTIME_CLIENT_EVENTS.externalFormLeaveUser, { user_id: userId })
  },
  submitUser: (payload: ExternalFormSubmitPayload<TFormData>) => {
    if (!Number.isFinite(payload.user_id) || payload.user_id <= 0) {
      return
    }

    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormSubmitUser, payload)
  },
  requestUser: (payload: ExternalFormRequestPayload) => {
    if (!Number.isFinite(payload.user_id) || payload.user_id <= 0) {
      return
    }

    client.connect()
    client.publish(REALTIME_CLIENT_EVENTS.externalFormRequestUser, payload)
  },
  onReceived: (handler: (payload: ExternalFormReceivedPayload<TFormData>) => void) =>
    client.on<ExternalFormReceivedPayload<TFormData>>(REALTIME_SERVER_EVENTS.externalFormReceived, handler),
  onRequested: (handler: (payload: ExternalFormRequestedPayload) => void) =>
    client.on<ExternalFormRequestedPayload>(REALTIME_SERVER_EVENTS.externalFormRequested, handler),
})
