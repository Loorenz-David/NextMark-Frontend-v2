import { useEffect, useMemo } from 'react'
import { createOrderChatChannel, type BusinessEventEnvelope } from '@shared-realtime'
import { adminRealtimeClient } from '@/realtime/client'

type BusinessPayload = Record<string, unknown>

const getPayloadNumber = (payload: BusinessPayload, key: string): number | null => {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

type UseOrderCaseChatRealtimeOptions = {
  orderId: number | null | undefined
  onMessageCreated: (event: BusinessEventEnvelope<BusinessPayload>) => void
}

export const useOrderCaseChatRealtime = ({
  orderId,
  onMessageCreated,
}: UseOrderCaseChatRealtimeOptions) => {
  const orderChatChannel = useMemo(
    () => createOrderChatChannel(adminRealtimeClient),
    [],
  )

  useEffect(() => {
    if (typeof orderId !== 'number') {
      return
    }

    return orderChatChannel.subscribeOrderChat(orderId, (event) => {
      const payload = event.payload ?? {}
      if (getPayloadNumber(payload, 'order_id') !== orderId) {
        return
      }

      onMessageCreated(event)
    })
  }, [onMessageCreated, orderChatChannel, orderId])
}
