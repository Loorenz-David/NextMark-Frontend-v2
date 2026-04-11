import type { AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'

export function buildMapNavigationDestination(stop: AssignedStopViewModel): MapNavigationDestination | null {
  const streetAddress = stop.address?.street_address?.trim() ?? ''
  const label = stop.title?.trim() || streetAddress || 'Stop destination'
  const address = streetAddress || null
  const coordinates = stop.address?.coordinates ?? null

  if (!address && !coordinates) {
    return null
  }

  return {
    label,
    address,
    coordinates,
  }
}
