import { buildClientId } from '@/lib/utils/clientId'
import type { CaseChat, OrderCase, OrderCaseMap, OrderCaseState } from '../types'


export const CaseRegistry:Record<OrderCaseState,OrderCaseState> = {
  Open: 'Open',
  Resolving: 'Resolving',
  Resolved: 'Resolved'
}

const toCaseClientId = (orderCase: Partial<OrderCase>) =>
  orderCase.client_id ?? (typeof orderCase.id === 'number' ? `order-case-${orderCase.id}` : `order-case-${crypto.randomUUID()}`)

const toChatClientId = (chat: Partial<CaseChat>) =>
  chat.client_id ?? (typeof chat.id === 'number' ? `case-chat-${chat.id}` : `case-chat-${crypto.randomUUID()}`)

const normalizeChat = (chat: Partial<CaseChat>, orderCaseId: number): CaseChat | null => {
  if (typeof chat.id !== 'number') return null

  return {
    id: chat.id,
    client_id: toChatClientId(chat),
    message: String(chat.message ?? ''),
    creation_date: String(chat.creation_date ?? ''),
    user_id: typeof chat.user_id === 'number' ? chat.user_id : null,
    user_name: typeof chat.user_name === 'string' ? chat.user_name : null,
    order_case_id: typeof chat.order_case_id === 'number' ? chat.order_case_id : orderCaseId,
  }
}

const normalizeOrderCase = (value: Partial<OrderCase>): OrderCase | null => {
  if (typeof value.id !== 'number') return null
  if (typeof value.order_id !== 'number') return null

  const rawState = String(value.state ?? CaseRegistry.Open) as OrderCaseState
  const state =  rawState in CaseRegistry ? rawState : CaseRegistry.Open

  const chats = Array.isArray(value.chats)
    ? value.chats
        .map((chat) => normalizeChat(chat, value.id as number))
        .filter((chat): chat is CaseChat => Boolean(chat))
    : []

  return {
    id: value.id,
    client_id: toCaseClientId(value),
    order_id: value.order_id,
    label: value.label ?? null,
    state,
    order_reference: value.order_reference,
    creation_date: String(value.creation_date ?? ''),
    created_by: typeof value.created_by === 'number' ? value.created_by : null,
    unseen_chats: typeof value.unseen_chats === 'number' ? value.unseen_chats : 0,
    chats,
  }
}

const fromArray = (items: Array<Partial<OrderCase>>): OrderCaseMap => {
  const byClientId: Record<string, OrderCase> = {}
  const allIds: string[] = []

  items.forEach((item) => {
    const normalized = normalizeOrderCase(item)
    if (!normalized) return

    byClientId[normalized.client_id] = normalized
    allIds.push(normalized.client_id)
  })

  return { byClientId, allIds }
}

const isOrderCaseMap = (value: unknown): value is OrderCaseMap => {
  if (!value || typeof value !== 'object') return false
  return 'byClientId' in value && 'allIds' in value
}

export const useOrderCaseModel = () => {
  const normalizeOrderCaseMap = (
    payload: OrderCaseMap | OrderCase | OrderCase[] | Record<string, OrderCase> | null | undefined,
  ): OrderCaseMap => {
    if (!payload) return { byClientId: {}, allIds: [] }

    if (Array.isArray(payload)) {
      return fromArray(payload)
    }

    if (isOrderCaseMap(payload)) {
      return fromArray(payload.allIds.map((clientId) => payload.byClientId[clientId]))
    }

    if (typeof payload === 'object' && 'id' in payload) {
      return fromArray([payload as OrderCase])
    }

    return fromArray(Object.values(payload as Record<string, OrderCase>))
  }

  const normalizeOrderCaseEntity = (payload: OrderCase | null | undefined) => {
    if (!payload) return null
    return normalizeOrderCase(payload)
  }

  const buildInitialCase = (orderId:number, sessionUserId:number | null):OrderCase=>{
    return{
            client_id: buildClientId('order-case-temp'),
            order_id: orderId,
            label: null,
            state: CaseRegistry.Open,
            creation_date: new Date().toISOString(),
            created_by: sessionUserId,
            unseen_chats: 0,
            chats: [],
        }
  }

  const stripCaseForCreation = (payload:OrderCase) =>{
    return{
      client_id: payload.client_id,
      order_id: payload.order_id,
      state: payload.state,
    }
  }

  return {
    normalizeOrderCaseMap,
    normalizeOrderCaseEntity,
    buildInitialCase,
    stripCaseForCreation
  }
}
