const MAX_RECENT_EVENT_IDS = 300

const recentEventIds = new Map<string, number>()
const inFlightOrderRefreshes = new Map<number, Promise<unknown>>()
const inFlightOrderCaseRefreshes = new Map<number, Promise<void>>()
const inFlightOrderRouteContextRefreshes = new Map<number, Promise<void>>()
const inFlightPlanRefreshes = new Map<number, Promise<void>>()
let inFlightGlobalOrderCasesRefresh: Promise<void> | null = null

export const markAdminBusinessEventHandled = (eventId: string): boolean => {
  if (!eventId) {
    return true
  }

  if (recentEventIds.has(eventId)) {
    return false
  }

  recentEventIds.set(eventId, Date.now())

  if (recentEventIds.size > MAX_RECENT_EVENT_IDS) {
    const oldestKey = recentEventIds.keys().next().value
    if (oldestKey) {
      recentEventIds.delete(oldestKey)
    }
  }

  return true
}

export const runDedupedOrderRefresh = (
  orderId: number,
  refresh: () => Promise<unknown>,
) => {
  const existing = inFlightOrderRefreshes.get(orderId)
  if (existing) {
    return existing
  }

  const request = refresh().finally(() => {
    inFlightOrderRefreshes.delete(orderId)
  })

  inFlightOrderRefreshes.set(orderId, request)
  return request
}

export const runDedupedOrderCaseRefresh = (
  orderId: number,
  refresh: () => Promise<void>,
) => {
  const existing = inFlightOrderCaseRefreshes.get(orderId)
  if (existing) {
    return existing
  }

  const request = refresh().finally(() => {
    inFlightOrderCaseRefreshes.delete(orderId)
  })

  inFlightOrderCaseRefreshes.set(orderId, request)
  return request
}

export const runDedupedGlobalOrderCasesRefresh = (
  refresh: () => Promise<void>,
) => {
  if (inFlightGlobalOrderCasesRefresh) {
    return inFlightGlobalOrderCasesRefresh
  }

  inFlightGlobalOrderCasesRefresh = refresh().finally(() => {
    inFlightGlobalOrderCasesRefresh = null
  })

  return inFlightGlobalOrderCasesRefresh
}

export const runDedupedPlanRefresh = (
  planId: number,
  refresh: () => Promise<void>,
) => {
  const existing = inFlightPlanRefreshes.get(planId)
  if (existing) {
    return existing
  }

  const request = refresh().finally(() => {
    inFlightPlanRefreshes.delete(planId)
  })

  inFlightPlanRefreshes.set(planId, request)
  return request
}

export const runDedupedOrderRouteContextRefresh = (
  orderId: number,
  refresh: () => Promise<void>,
) => {
  const existing = inFlightOrderRouteContextRefreshes.get(orderId)
  if (existing) {
    return existing
  }

  const request = refresh().finally(() => {
    inFlightOrderRouteContextRefreshes.delete(orderId)
  })

  inFlightOrderRouteContextRefreshes.set(orderId, request)
  return request
}
