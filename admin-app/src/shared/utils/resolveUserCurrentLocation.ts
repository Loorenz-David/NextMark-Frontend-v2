import type { address } from '@/types/address'
import { resolveBrowserCurrentCoordinates } from './browserGeolocation'

export const resolveUserCurrentLocation = (): Promise<address | null> => {
  return resolveBrowserCurrentCoordinates().then((coordinates) => {
    if (!coordinates) {
      return null
    }

    return {
      street_address: 'Current Location',
      coordinates,
    }
  })
}
