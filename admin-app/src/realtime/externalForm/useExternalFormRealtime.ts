import { useEffect, useRef } from 'react'

import {
  joinExternalFormUserRoom,
  leaveExternalFormUserRoom,
  subscribeToExternalFormReceived,
  subscribeToExternalFormRequested,
  unsubscribeFromExternalFormReceived,
  unsubscribeFromExternalFormRequested,
  type ExternalFormReceivedPayload,
  type ExternalFormRequestedPayload,
} from './externalForm.realtime'

export const useExternalFormRealtime = ({
  userId,
  onReceived,
  onRequested,
}: {
  userId: number
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
    if (!Number.isFinite(userId) || userId <= 0) {
      return
    }

    const handleReceived = (payload: ExternalFormReceivedPayload) => {
      onReceivedRef.current?.(payload)
    }

    const handleRequested = (payload: ExternalFormRequestedPayload) => {
      onRequestedRef.current?.(payload)
    }

    joinExternalFormUserRoom(userId)
    subscribeToExternalFormReceived(handleReceived)
    subscribeToExternalFormRequested(handleRequested)

    return () => {
      leaveExternalFormUserRoom(userId)
      unsubscribeFromExternalFormReceived(handleReceived)
      unsubscribeFromExternalFormRequested(handleRequested)
    }
  }, [userId])
}
