import { useEffect, useRef } from 'react'

import {
  joinExternalFormRoom,
  leaveExternalFormRoom,
  subscribeToExternalFormReceived,
  subscribeToExternalFormRequested,
  unsubscribeFromExternalFormReceived,
  unsubscribeFromExternalFormRequested,
  type ExternalFormReceivedPayload,
  type ExternalFormRequestedPayload,
} from './externalForm.realtime'

export const useExternalFormRealtime = ({
  onReceived,
  onRequested,
}: {
  onReceived?: (payload: ExternalFormReceivedPayload) => void
  onRequested?: (payload: ExternalFormRequestedPayload) => void
}) => {
  const onReceivedRef = useRef<typeof onReceived>(onReceived)
  const onRequestedRef = useRef<typeof onRequested>(onRequested)

  useEffect(() => {
    onReceivedRef.current = onReceived
  }, [onReceived])

  useEffect(() => {
    onRequestedRef.current = onRequested
  }, [onRequested])

  useEffect(() => {
    const handleReceived = (payload: ExternalFormReceivedPayload) => {
      onReceivedRef.current?.(payload)
    }

    const handleRequested = (payload: ExternalFormRequestedPayload) => {
      onRequestedRef.current?.(payload)
    }

    // Team-scoped room — join once while mounted; the backend derives the team
    // from the authenticated socket, so no user id is needed.
    joinExternalFormRoom()
    subscribeToExternalFormReceived(handleReceived)
    subscribeToExternalFormRequested(handleRequested)

    return () => {
      leaveExternalFormRoom()
      unsubscribeFromExternalFormReceived(handleReceived)
      unsubscribeFromExternalFormRequested(handleRequested)
    }
  }, [])
}
