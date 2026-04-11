import type { OrderOperationTypes } from '../types/order'
import type { MapMarkerOperationDirection } from '@/shared/map'

const CANONICAL_BOTH_VALUE = 'pickup_dropoff'

const normalizeOperationType = (
  value: string | null | undefined,
): OrderOperationTypes | null => {
  if (!value) return null
  if (value === 'pickup' || value === 'dropoff' || value === CANONICAL_BOTH_VALUE) {
    return value
  }
  if (value === 'pickup-dropoff') {
    return CANONICAL_BOTH_VALUE
  }
  return null
}

export const resolveOrderOperationBadgeDirections = (
  operationType: string | null | undefined,
): MapMarkerOperationDirection[] => {
  const normalized = normalizeOperationType(operationType)
  if (normalized === 'pickup') return ['up']
  if (normalized === 'dropoff') return ['down']
  if (normalized === CANONICAL_BOTH_VALUE) return ['up', 'down']
  return []
}

export const resolveOrderGroupOperationBadgeDirections = (
  operationTypes: Array<string | null | undefined>,
): MapMarkerOperationDirection[] => {
  const hasUp = operationTypes.some((value) =>
    resolveOrderOperationBadgeDirections(value).includes('up'),
  )
  const hasDown = operationTypes.some((value) =>
    resolveOrderOperationBadgeDirections(value).includes('down'),
  )

  if (hasUp && hasDown) return ['up', 'down']
  if (hasUp) return ['up']
  if (hasDown) return ['down']
  return []
}

