import type { DriverWorkspaceScopeKey } from '@/app/contracts/driverSession.types'
import { initializeActiveRoutesFlow } from '@/features/routes'
import { initializeOrderCasesForOrderFlow } from '@/features/order-case'

const MAX_RECENT_EVENT_IDS = 200

const recentEventIds = new Map<string, number>()
const inFlightRouteRefreshes = new Map<DriverWorkspaceScopeKey, Promise<void>>()
const inFlightOrderCaseRefreshes = new Map<number, Promise<boolean>>()
const queuedRouteRefreshes = new Set<DriverWorkspaceScopeKey>()

export function markDriverRealtimeEventHandled(eventId: string): boolean {
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

export function refreshDriverRealtimeRoutes(
  workspaceScopeKey: DriverWorkspaceScopeKey,
): Promise<void> {
  const existing = inFlightRouteRefreshes.get(workspaceScopeKey)
  if (existing) {
    queuedRouteRefreshes.add(workspaceScopeKey)
    return existing
  }

  const request = (async () => {
    do {
      queuedRouteRefreshes.delete(workspaceScopeKey)
      await initializeActiveRoutesFlow({ workspaceScopeKey })
    } while (queuedRouteRefreshes.has(workspaceScopeKey))
  })()
    .finally(() => {
      queuedRouteRefreshes.delete(workspaceScopeKey)
      inFlightRouteRefreshes.delete(workspaceScopeKey)
    })

  inFlightRouteRefreshes.set(workspaceScopeKey, request)
  return request
}

export const refreshDriverRouteSummaries = refreshDriverRealtimeRoutes

export function refreshDriverRealtimeOrderCases(orderId: number): Promise<boolean> {
  const existing = inFlightOrderCaseRefreshes.get(orderId)
  if (existing) {
    return existing
  }

  const request = initializeOrderCasesForOrderFlow(orderId, { force: true })
    .finally(() => {
      inFlightOrderCaseRefreshes.delete(orderId)
    })

  inFlightOrderCaseRefreshes.set(orderId, request)
  return request
}
