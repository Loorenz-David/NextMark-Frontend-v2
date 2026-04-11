import { REALTIME_SERVER_EVENTS, type ClientFormSubmittedPayload } from '../contracts'
import type { SharedRealtimeClient } from '../core/client'

export const createClientFormChannel = (client: SharedRealtimeClient) => ({
  onSubmitted: (handler: (payload: ClientFormSubmittedPayload) => void) =>
    client.on<ClientFormSubmittedPayload>(REALTIME_SERVER_EVENTS.clientFormSubmitted, handler),
})
