import { getCaseChatsApi } from '../api'
import { mapCaseChatsDtoToCaseChats, type CaseChatMap } from '../domain'

export type LoadCaseChatsQueryResult = {
  orderCaseId: number
  caseChats: CaseChatMap
}

export async function loadCaseChatsQuery(orderCaseId: number): Promise<LoadCaseChatsQueryResult> {
  const response = await getCaseChatsApi({ order_case_id: orderCaseId })

  return {
    orderCaseId,
    caseChats: mapCaseChatsDtoToCaseChats(response.data.case_chats),
  }
}
