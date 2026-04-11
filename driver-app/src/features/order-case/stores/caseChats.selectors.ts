import {
  selectAll,
  selectByClientId,
  selectByServerId,
  type EntityTable,
} from '@shared-store'
import type { CaseChat } from '../domain'

export const selectAllCaseChats = (state: EntityTable<CaseChat>) => selectAll<CaseChat>()(state)

export const selectCaseChatByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<CaseChat>) => selectByClientId<CaseChat>(clientId)(state)

export const selectCaseChatByServerId = (id: number | null | undefined) =>
  (state: EntityTable<CaseChat>) => selectByServerId<CaseChat>(id)(state)

export const selectCaseChatsByOrderCaseId = (
  state: EntityTable<CaseChat>,
  orderCaseId: number | null | undefined,
) => {
  if (orderCaseId == null) return []

  return state.allIds
    .map((clientId) => state.byClientId[clientId])
    .filter((chat) => chat?.order_case_id === orderCaseId)
}
