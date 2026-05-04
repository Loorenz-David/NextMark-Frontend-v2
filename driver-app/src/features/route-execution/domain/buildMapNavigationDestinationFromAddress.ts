import type { address } from '@shared-domain'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'

export function buildMapNavigationDestinationFromAddress(
  label: string,
  addr: address | null,
): MapNavigationDestination | null {
  if (!addr) {
    return null
  }

  const streetAddress = addr.street_address?.trim() ?? ''
  const displayLabel = label?.trim() || streetAddress || 'Destination'
  const address_str = streetAddress || null
  const coordinates = addr.coordinates ?? null

  if (!address_str && !coordinates) {
    return null
  }

  return {
    label: displayLabel,
    address: address_str,
    coordinates,
  }
}
