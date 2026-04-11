import type { Order } from '../types/order'
import {
  buildOrderAddressKey,
  buildOrderAddressLabelCandidate,
  normalizeStreetLine,
} from './orderAddressGroup.key'

export const MAX_GROUP_CHILDREN_RENDER = 50

export type OrderAddressGroup = {
  key: string
  label: string
  orders: Order[]
  orderIds: number[]
  earliestDeliveryMs: number
  earliestCreationMs: number
}

const toMs = (value: string | null | undefined): number => {
  if (!value) return Number.POSITIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY
}

const resolveOrderDeliveryMs = (order: Order): number => {
  const fromWindow = order.delivery_windows
    ?.map((window) => toMs(window.start_at))
    .find((ms) => Number.isFinite(ms))
  if (Number.isFinite(fromWindow)) {
    return fromWindow as number
  }

  return Number.POSITIVE_INFINITY
}

const resolveOrderCreationMs = (order: Order): number => toMs(order.creation_date)

const resolveOrderNumericId = (order: Order): number =>
  typeof order.id === 'number' && Number.isFinite(order.id)
    ? order.id
    : Number.POSITIVE_INFINITY

export const compareOrdersForGroup = (left: Order, right: Order): number => {
  const byDelivery = resolveOrderDeliveryMs(left) - resolveOrderDeliveryMs(right)
  if (byDelivery !== 0) return byDelivery

  const byCreation = resolveOrderCreationMs(left) - resolveOrderCreationMs(right)
  if (byCreation !== 0) return byCreation

  const byId = resolveOrderNumericId(left) - resolveOrderNumericId(right)
  if (byId !== 0) return byId

  return left.client_id.localeCompare(right.client_id)
}

const resolveMostCommonAddressLabel = (orders: Order[]): string => {
  const buckets = new Map<string, { count: number; bestLabel: string }>()

  orders.forEach((order) => {
    const labelCandidate = buildOrderAddressLabelCandidate(order)
    const normalized = normalizeStreetLine(labelCandidate)
    const key = normalized || labelCandidate.trim().toLowerCase() || 'no-address'
    const existing = buckets.get(key)

    if (!existing) {
      buckets.set(key, {
        count: 1,
        bestLabel: labelCandidate,
      })
      return
    }

    existing.count += 1
    if (labelCandidate.length > existing.bestLabel.length) {
      existing.bestLabel = labelCandidate
    }
  })

  let winner = 'No address'
  let winnerCount = -1
  let winnerLength = -1

  buckets.forEach((bucket) => {
    if (
      bucket.count > winnerCount
      || (bucket.count === winnerCount && bucket.bestLabel.length > winnerLength)
    ) {
      winner = bucket.bestLabel
      winnerCount = bucket.count
      winnerLength = bucket.bestLabel.length
    }
  })

  return winner
}

export const buildOrderAddressGroups = (orders: Order[]): OrderAddressGroup[] => {
  const grouped = new Map<string, Order[]>()

  orders.forEach((order) => {
    const key = buildOrderAddressKey(order)
    const existing = grouped.get(key)
    if (existing) {
      existing.push(order)
      return
    }
    grouped.set(key, [order])
  })

  const groups = Array.from(grouped.entries()).map(([key, groupOrders]) => {
    const sortedOrders = [...groupOrders].sort(compareOrdersForGroup)
    const earliestDeliveryMs = sortedOrders.reduce(
      (min, order) => Math.min(min, resolveOrderDeliveryMs(order)),
      Number.POSITIVE_INFINITY,
    )
    const earliestCreationMs = sortedOrders.reduce(
      (min, order) => Math.min(min, resolveOrderCreationMs(order)),
      Number.POSITIVE_INFINITY,
    )

    return {
      key,
      label: resolveMostCommonAddressLabel(sortedOrders),
      orders: sortedOrders,
      orderIds: sortedOrders
        .map((order) => order.id)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id)),
      earliestDeliveryMs,
      earliestCreationMs,
    }
  })

  groups.sort((left, right) => {
    const byDelivery = left.earliestDeliveryMs - right.earliestDeliveryMs
    if (byDelivery !== 0) return byDelivery

    const byCreation = left.earliestCreationMs - right.earliestCreationMs
    if (byCreation !== 0) return byCreation

    return left.key.localeCompare(right.key)
  })

  return groups
}
