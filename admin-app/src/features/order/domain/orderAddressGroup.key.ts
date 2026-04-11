import type { Order } from '../types/order'

const MULTISPACE_RE = /\s+/g
const TRAILING_COMMAS_RE = /,+$/g

export const isValidCoordinateValue = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
)

export const isValidCoordinates = (lat: unknown, lng: unknown): lat is number => {
  if (!isValidCoordinateValue(lat) || !isValidCoordinateValue(lng)) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim().replace(MULTISPACE_RE, ' ')
}

const normalizeStreetName = (value: unknown): string =>
  normalizeText(value).toLowerCase()

const normalizeStreetNumber = (value: unknown): string =>
  normalizeText(value)

const normalizePostalCode = (value: unknown): string =>
  normalizeText(value).replace(/\s+/g, '').toUpperCase()

export const normalizeStreetLine = (value: unknown): string => {
  const normalized = normalizeText(value).toLowerCase().replace(TRAILING_COMMAS_RE, '')
  return normalized.trim()
}

const buildStructuredAddressKey = (address: Record<string, unknown>): string | null => {
  const streetName = normalizeStreetName(address.street_name)
  const streetNumber = normalizeStreetNumber(address.street_number)
  const postalCode = normalizePostalCode(address.postal_code)

  if (!streetName || !streetNumber || !postalCode) {
    return null
  }

  return `${streetName}_${streetNumber}_${postalCode}`
}

const buildCoordinateKey = (address: Record<string, unknown>): string | null => {
  const coords = address.coordinates as Record<string, unknown> | undefined
  const lat = coords?.lat
  const lng = coords?.lng
  if (!isValidCoordinates(lat, lng)) return null
  return `${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`
}

export const buildOrderAddressKey = (order: Order): string => {
  const address = order.client_address as unknown as Record<string, unknown> | null | undefined
  if (!address) {
    return `client:${order.client_id}`
  }

  const coordinateKey = buildCoordinateKey(address)
  if (coordinateKey) {
    return coordinateKey
  }

  const structuredKey = buildStructuredAddressKey(address)
  if (structuredKey) {
    return structuredKey
  }

  const streetKey = normalizeStreetLine(address.street_address)
  if (streetKey) {
    return streetKey
  }

  return `client:${order.client_id}`
}

export const buildOrderAddressLabelCandidate = (order: Order): string => {
  const address = order.client_address as unknown as Record<string, unknown> | null | undefined
  if (!address) return 'No address'

  const streetLine = normalizeText(address.street_address)
  if (streetLine) return streetLine

  const streetName = normalizeText(address.street_name)
  const streetNumber = normalizeText(address.street_number)
  const postalCode = normalizeText(address.postal_code)
  const structured = [streetName, streetNumber, postalCode].filter(Boolean).join(' ')

  return structured || 'No address'
}
