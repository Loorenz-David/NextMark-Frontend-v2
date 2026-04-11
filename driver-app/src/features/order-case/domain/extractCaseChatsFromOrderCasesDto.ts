import type { CaseChatDto, OrderCaseDto } from '../api'
import { mapCaseChatsDtoToCaseChats } from './mapOrderCasesDtoToOrderCases'
import type { CaseChatMap } from './orderCase.types'

function toOrderCaseDtos(
  payload: OrderCaseDto[] | Record<string, OrderCaseDto> | OrderCaseDto | null | undefined,
): OrderCaseDto[] {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload
  }

  if (typeof payload === 'object' && 'id' in payload) {
    return [payload]
  }

  return Object.values(payload as Record<string, OrderCaseDto>)
}

export function extractCaseChatsFromOrderCasesDto(
  payload: OrderCaseDto[] | Record<string, OrderCaseDto> | OrderCaseDto | null | undefined,
): CaseChatMap {
  const chats: CaseChatDto[] = []

  toOrderCaseDtos(payload).forEach((orderCase) => {
    const caseChats = orderCase.chats
    if (!caseChats) {
      return
    }

    if (Array.isArray(caseChats)) {
      chats.push(...caseChats)
      return
    }

    chats.push(...Object.values(caseChats))
  })

  return mapCaseChatsDtoToCaseChats(chats)
}
