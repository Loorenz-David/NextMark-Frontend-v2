import {
  setCaseChats,
  setOrderCaseListLoading,
  setOrderCaseListError,
  setOrderCaseListResult,
  setOrderCaseQueryFilters,
  upsertOrderCases,
  useOrderCaseListStore,
} from '../stores'
import { loadOrderCasesQuery } from '../actions'

const inFlightOrderCaseLoads = new Map<number, Promise<boolean>>()

type InitializeOrderCasesForOrderFlowOptions = {
  force?: boolean
}

export async function initializeOrderCasesForOrderFlow(
  orderId: number,
  options: InitializeOrderCasesForOrderFlowOptions = {},
) {
  const { force = false } = options
  const existingScope = useOrderCaseListStore.getState().scopes[orderId]

  if (!force && existingScope && !existingScope.isLoading && !existingScope.error && existingScope.queryKey) {
    return true
  }

  const existingRequest = inFlightOrderCaseLoads.get(orderId)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async () => {
  setOrderCaseListLoading(orderId, true)

  try {
    const result = await loadOrderCasesQuery(orderId)
    upsertOrderCases(result.cases)
    setCaseChats(result.caseChats)
    setOrderCaseQueryFilters(orderId, result.query)
    setOrderCaseListResult(orderId, {
      queryKey: `order:${orderId}`,
      caseClientIds: result.cases.allIds.filter((clientId) => result.cases.byClientId[clientId]?.order_id === orderId),
      query: result.query,
      stats: result.stats,
      pagination: result.pagination,
    })
    return true
  } catch (error) {
    console.error('Failed to initialize order cases for order', error)
    setOrderCaseListError(orderId, 'Unable to load order cases.')
    return false
  } finally {
    inFlightOrderCaseLoads.delete(orderId)
  }
  })()

  inFlightOrderCaseLoads.set(orderId, request)
  return request
}
