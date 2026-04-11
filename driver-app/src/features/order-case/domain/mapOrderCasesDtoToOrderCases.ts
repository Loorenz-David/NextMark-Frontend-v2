import type { CaseChatMap, OrderCase, OrderCaseMap, OrderCaseState } from './orderCase.types'
import type { CaseChatDto, OrderCaseDto } from '../api'

const CASE_STATE_REGISTRY: Record<OrderCaseState, OrderCaseState> = {
  Open: 'Open',
  Resolving: 'Resolving',
  Resolved: 'Resolved',
}

function toCaseClientId(orderCase: Partial<OrderCaseDto>) {
  return orderCase.client_id ?? (typeof orderCase.id === 'number' ? `order-case-${orderCase.id}` : `order-case-${crypto.randomUUID()}`)
}

function normalizeOrderCase(value: Partial<OrderCaseDto>): OrderCase | null {
  if (typeof value.id !== 'number') return null
  if (typeof value.order_id !== 'number') return null

  const rawState = String(value.state ?? CASE_STATE_REGISTRY.Open) as OrderCaseState
  const state = rawState in CASE_STATE_REGISTRY ? rawState : CASE_STATE_REGISTRY.Open

  return {
    id: value.id,
    client_id: toCaseClientId(value),
    order_id: value.order_id,
    label: value.label ?? null,
    state,
    order_reference: value.order_reference ?? undefined,
    creation_date: String(value.creation_date ?? ''),
    created_by: typeof value.created_by === 'number' ? value.created_by : null,
    unseen_chats: typeof value.unseen_chats === 'number' ? value.unseen_chats : 0,
  }
}

function fromArray(items: Array<Partial<OrderCaseDto>>): OrderCaseMap {
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

const isCaseChatMap = (value: unknown): value is CaseChatMap => {
  if (!value || typeof value !== 'object') return false
  return 'byClientId' in value && 'allIds' in value
}

export function mapOrderCasesDtoToOrderCases(
  payload: OrderCaseMap | OrderCaseDto | OrderCaseDto[] | Record<string, OrderCaseDto> | null | undefined,
): OrderCaseMap {
  if (!payload) return { byClientId: {}, allIds: [] }

  if (Array.isArray(payload)) {
    return fromArray(payload)
  }

  if (isOrderCaseMap(payload)) {
    return fromArray(payload.allIds.map((clientId) => payload.byClientId[clientId]))
  }

  if (typeof payload === 'object' && 'id' in payload) {
    return fromArray([payload as OrderCaseDto])
  }

  return fromArray(Object.values(payload as Record<string, OrderCaseDto>))
}

function toChatClientId(chat: Partial<CaseChatDto>) {
  return chat.client_id ?? (typeof chat.id === 'number' ? `case-chat-${chat.id}` : `case-chat-${crypto.randomUUID()}`)
}

export function mapCaseChatsDtoToCaseChats(
  payload: CaseChatMap | CaseChatDto[] | Record<string, CaseChatDto> | CaseChatDto | null | undefined,
): CaseChatMap {
  const byClientId: CaseChatMap['byClientId'] = {}
  const allIds: string[] = []

  const values = !payload
    ? []
    : Array.isArray(payload)
      ? payload
      : isCaseChatMap(payload)
        ? payload.allIds.map((clientId) => payload.byClientId[clientId])
      : typeof payload === 'object' && 'id' in payload
        ? [payload]
        : Object.values(payload as Record<string, CaseChatDto>)

  values.forEach((chat) => {
    if (typeof chat.id !== 'number' || typeof chat.order_case_id !== 'number') {
      return
    }

    const clientId = toChatClientId(chat)
    byClientId[clientId] = {
      id: chat.id,
      client_id: clientId,
      message: String(chat.message ?? ''),
      creation_date: String(chat.creation_date ?? ''),
      user_id: typeof chat.user_id === 'number' ? chat.user_id : null,
      user_name: typeof chat.user_name === 'string' ? chat.user_name : null,
      order_case_id: chat.order_case_id,
    }
    allIds.push(clientId)
  })

  return { byClientId, allIds }
}
