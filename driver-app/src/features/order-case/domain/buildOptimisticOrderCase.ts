import type { CaseChat, OrderCase } from './orderCase.types'

export function buildOrderCaseClientId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `order-case_${crypto.randomUUID()}`
    : `order-case_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function buildCaseChatClientId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? `case-chat_${crypto.randomUUID()}`
    : `case-chat_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function buildOptimisticOrderCase(orderId: number, clientId: string): OrderCase {
  return {
    client_id: clientId,
    order_id: orderId,
    label: null,
    state: 'Open',
    creation_date: new Date().toISOString(),
    created_by: null,
    unseen_chats: 0,
  }
}

export function buildOptimisticCaseChat(
  orderCaseId: number,
  clientId: string,
  message: string,
  userName?: string | null,
): CaseChat {
  return {
    client_id: clientId,
    message,
    creation_date: new Date().toISOString(),
    user_id: null,
    user_name: userName ?? null,
    order_case_id: orderCaseId,
  }
}
