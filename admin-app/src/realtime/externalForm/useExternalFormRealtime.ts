import { useEffect, useRef } from 'react'

import {
  joinExternalFormRoom,
  leaveExternalFormRoom,
  subscribeToExternalFormProgress,
  subscribeToExternalFormReceived,
  subscribeToExternalFormRequested,
  unsubscribeFromExternalFormProgress,
  unsubscribeFromExternalFormReceived,
  unsubscribeFromExternalFormRequested,
  type ExternalFormProgressPayload,
  type ExternalFormReceivedPayload,
  type ExternalFormRequestedPayload,
} from './externalForm.realtime'

export const useExternalFormRealtime = ({
  onReceived,
  onRequested,
  onProgress,
}: {
  onReceived?: (payload: ExternalFormReceivedPayload) => void
  onRequested?: (payload: ExternalFormRequestedPayload) => void
  onProgress?: (payload: ExternalFormProgressPayload) => void
}) => {
  const onReceivedRef = useRef<typeof onReceived>(onReceived)
  const onRequestedRef = useRef<typeof onRequested>(onRequested)
  const onProgressRef = useRef<typeof onProgress>(onProgress)

  useEffect(() => {
    onReceivedRef.current = onReceived
  }, [onReceived])

  useEffect(() => {
    onRequestedRef.current = onRequested
  }, [onRequested])

  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  useEffect(() => {
    const handleReceived = (payload: ExternalFormReceivedPayload) => {
      onReceivedRef.current?.(payload)
    }

    const handleRequested = (payload: ExternalFormRequestedPayload) => {
      onRequestedRef.current?.(payload)
    }

    const handleProgress = (payload: ExternalFormProgressPayload) => {
      onProgressRef.current?.(payload)
    }

    // Team-scoped room — join once while mounted; the backend derives the team
    // from the authenticated socket, so no user id is needed.
    joinExternalFormRoom()
    subscribeToExternalFormReceived(handleReceived)
    subscribeToExternalFormRequested(handleRequested)
    subscribeToExternalFormProgress(handleProgress)

    return () => {
      leaveExternalFormRoom()
      unsubscribeFromExternalFormReceived(handleReceived)
      unsubscribeFromExternalFormRequested(handleRequested)
      unsubscribeFromExternalFormProgress(handleProgress)
    }
  }, [])
}
