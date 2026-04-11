import type { Order } from '@/features/order/types/order'
import {
  buildOrderAddressKey,
  buildOrderAddressLabelCandidate,
  normalizeStreetLine,
} from '@/features/order/domain/orderAddressGroup.key'
import type { RouteSolutionStop } from '../types/routeSolutionStop'

type RouteGroupStopEntry = {
  stop: RouteSolutionStop
  order: Order
}

export type RouteGroupAddressGroup = {
  key: string
  addressKey: string
  label: string
  entries: RouteGroupStopEntry[]
  orderIds: number[]
  routeStopIds: number[]
  routeStopClientIds: string[]
  routeSolutionId: number | null
  firstAnchorStopId: number | null
  firstAnchorStopClientId: string | null
  lastAnchorStopId: number | null
  lastAnchorStopClientId: string | null
  anchorStopId: number | null
  anchorStopClientId: string | null
  firstStopOrder: number | null
  lastStopOrder: number | null
  minEta: string | null
  maxEta: string | null
  hasWarnings: boolean
}

const toEtaMs = (value: string | null | undefined): number => {
  if (!value || value === 'loading') return Number.NaN
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

const resolveEtaRange = (entries: RouteGroupStopEntry[]): { minEta: string | null; maxEta: string | null } => {
  let minMs = Number.POSITIVE_INFINITY
  let maxMs = Number.NEGATIVE_INFINITY
  let minEta: string | null = null
  let maxEta: string | null = null

  for (const entry of entries) {
    const eta = entry.stop.expected_arrival_time
    const ms = toEtaMs(eta)
    if (!Number.isFinite(ms) || !eta) {
      continue
    }

    if (ms < minMs) {
      minMs = ms
      minEta = eta
    }
    if (ms > maxMs) {
      maxMs = ms
      maxEta = eta
    }
  }

  return {
    minEta,
    maxEta,
  }
}

const resolveMostCommonGroupLabel = (entries: RouteGroupStopEntry[]): string => {
  const buckets = new Map<string, { count: number; bestLabel: string }>()

  entries.forEach((entry) => {
    const labelCandidate = buildOrderAddressLabelCandidate(entry.order)
    const normalized = normalizeStreetLine(labelCandidate) || 'no-address'
    const current = buckets.get(normalized)

    if (!current) {
      buckets.set(normalized, { count: 1, bestLabel: labelCandidate })
      return
    }

    current.count += 1
    if (labelCandidate.length > current.bestLabel.length) {
      current.bestLabel = labelCandidate
    }
  })

  let winner = 'No address'
  let winnerCount = -1
  let winnerLength = -1

  buckets.forEach((value) => {
    if (value.count > winnerCount || (value.count === winnerCount && value.bestLabel.length > winnerLength)) {
      winner = value.bestLabel
      winnerCount = value.count
      winnerLength = value.bestLabel.length
    }
  })

  return winner
}

const hasStopWarnings = (stop: RouteSolutionStop): boolean => (
  Boolean(stop.reason_was_skipped)
  || Boolean(stop.has_constraint_violation)
  || (Array.isArray(stop.constraint_warnings) && stop.constraint_warnings.length > 0)
)

const stopOrderValue = (entry: RouteGroupStopEntry): number => (
  typeof entry.stop.stop_order === 'number' ? entry.stop.stop_order : Number.POSITIVE_INFINITY
)

export const buildRouteGroupStopAddressGroups = (
  sortedEntries: RouteGroupStopEntry[],
): RouteGroupAddressGroup[] => {
  if (!sortedEntries.length) return []

  const groups: Array<{ addressKey: string; entries: RouteGroupStopEntry[] }> = []

  sortedEntries.forEach((entry) => {
    const addressKey = buildOrderAddressKey(entry.order)
    const last = groups[groups.length - 1]
    if (!last || last.addressKey !== addressKey) {
      groups.push({ addressKey, entries: [entry] })
      return
    }
    last.entries.push(entry)
  })

  return groups
    .map((group, index) => {
      const entries = [...group.entries].sort((left, right) => stopOrderValue(left) - stopOrderValue(right))
      const first = entries[0]
      const last = entries[entries.length - 1]
      const etaRange = resolveEtaRange(entries)

      return {
        key: `${group.addressKey}::${index}`,
        addressKey: group.addressKey,
        label: resolveMostCommonGroupLabel(entries),
        entries,
        orderIds: entries
          .map((entry) => entry.order.id)
          .filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
        routeStopIds: entries
          .map((entry) => entry.stop.id)
          .filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
        routeStopClientIds: entries
          .map((entry) => entry.stop.client_id)
          .filter((clientId): clientId is string => Boolean(clientId)),
        routeSolutionId: typeof first?.stop.route_solution_id === 'number' ? first.stop.route_solution_id : null,
        firstAnchorStopId: typeof first?.stop.id === 'number' ? first.stop.id : null,
        firstAnchorStopClientId: first?.stop.client_id ?? null,
        lastAnchorStopId: typeof last?.stop.id === 'number' ? last.stop.id : null,
        lastAnchorStopClientId: last?.stop.client_id ?? null,
        anchorStopId: typeof first?.stop.id === 'number' ? first.stop.id : null,
        anchorStopClientId: first?.stop.client_id ?? null,
        firstStopOrder: typeof first?.stop.stop_order === 'number' ? first.stop.stop_order : null,
        lastStopOrder: typeof last?.stop.stop_order === 'number' ? last.stop.stop_order : null,
        minEta: etaRange.minEta,
        maxEta: etaRange.maxEta,
        hasWarnings: entries.some((entry) => hasStopWarnings(entry.stop)),
      }
    })
    .sort((left, right) => {
      const leftOrder = left.firstStopOrder ?? Number.POSITIVE_INFINITY
      const rightOrder = right.firstStopOrder ?? Number.POSITIVE_INFINITY
      if (leftOrder !== rightOrder) return leftOrder - rightOrder
      return left.key.localeCompare(right.key)
    })
}
