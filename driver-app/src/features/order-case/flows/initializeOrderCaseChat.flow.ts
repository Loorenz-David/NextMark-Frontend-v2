import { shouldRefreshForFreshness } from '@shared-utils'
import { selectCaseChatsByOrderCaseId, selectOrderCaseByServerId, updateOrderCaseUnseenCount, upsertCaseChats, useCaseChatsStore, useOrderCasesStore } from '../stores'
import { loadCaseChatsQuery, markOrderCaseChatsReadAction } from '../actions'

const inFlightOrderCaseChatLoads = new Map<number, Promise<boolean>>()
const initializedOrderCaseChats = new Set<number>()

type InitializeOrderCaseChatFlowOptions = {
  force?: boolean
  freshAfter?: string | null
}

export async function initializeOrderCaseChatFlow(
  orderCaseId: number,
  options: InitializeOrderCaseChatFlowOptions = {},
) {
  const { force = false, freshAfter = null } = options

  if (orderCaseId <= 0) {
    return true
  }

  const existingChats = selectCaseChatsByOrderCaseId(useCaseChatsStore.getState(), orderCaseId)
  const orderCase = selectOrderCaseByServerId(orderCaseId)(useOrderCasesStore.getState())
  const unseenChats = orderCase?.unseen_chats
  const staleByFreshness = shouldRefreshForFreshness(orderCase?.updated_at ?? null, freshAfter)

  if (!force && !staleByFreshness && initializedOrderCaseChats.has(orderCaseId) && unseenChats === 0) {
    return true
  }

  if (!force && !staleByFreshness && existingChats.length > 0 && unseenChats === 0) {
    initializedOrderCaseChats.add(orderCaseId)
    return true
  }

  const existingRequest = inFlightOrderCaseChatLoads.get(orderCaseId)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async () => {
    try {
      const result = await loadCaseChatsQuery(orderCaseId)
      upsertCaseChats(result.caseChats)
      try {
        await markOrderCaseChatsReadAction(orderCaseId)
      } catch (error) {
        console.error('Failed to mark order case chats as read', error)
      }
      updateOrderCaseUnseenCount(orderCaseId, 0)
      initializedOrderCaseChats.add(orderCaseId)
      return true
    } catch (error) {
      console.error('Failed to initialize order case chat', error)
      return false
    } finally {
      inFlightOrderCaseChatLoads.delete(orderCaseId)
    }
  })()

  inFlightOrderCaseChatLoads.set(orderCaseId, request)
  return request
}
