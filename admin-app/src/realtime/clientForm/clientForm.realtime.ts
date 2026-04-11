/**
 * Singleton subscription module for the client_form:submitted realtime event.
 *
 * Follows the same pattern as externalForm.realtime.ts:
 * - One shared channel wrapper around the admin realtime client
 * - Stable subscribe/unsubscribe helpers so callers can register and deregister
 *   individual handlers without affecting other subscribers
 */

import type { ClientFormSubmittedPayload } from '@shared-realtime'
import { createClientFormChannel } from '@shared-realtime'
import { adminRealtimeClient } from '../client'

const clientFormChannel = createClientFormChannel(adminRealtimeClient)

// Track the raw unsubscribe function keyed by handler reference so we can
// clean up precisely without relying on positional registration order.
const submittedSubscriptions = new Map<
  (payload: ClientFormSubmittedPayload) => void,
  () => void
>()

export const subscribeToClientFormSubmitted = (
  handler: (payload: ClientFormSubmittedPayload) => void,
): (() => void) => {
  const release = clientFormChannel.onSubmitted(handler)
  submittedSubscriptions.set(handler, release)
  return release
}

export const unsubscribeFromClientFormSubmitted = (
  handler: (payload: ClientFormSubmittedPayload) => void,
): void => {
  const release = submittedSubscriptions.get(handler)
  if (!release) {
    return
  }
  submittedSubscriptions.delete(handler)
  release()
}
