import type { Order } from '@shared-domain'

export interface AiOrderDetailOpenPayload {
  clientId?: string
  serverId?: number
  mode: 'view' | 'edit'
}

export function resolveAiOrderDetailPayload(order: Order): AiOrderDetailOpenPayload | null {
  const clientId = typeof order.client_id === 'string' && order.client_id.trim().length > 0
    ? order.client_id
    : undefined

  const serverId = typeof order.id === 'number' ? order.id : undefined

  if (!clientId && serverId === undefined) {
    return null
  }

  return {
    clientId,
    serverId,
    mode: 'view',
  }
}
