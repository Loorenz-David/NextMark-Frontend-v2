import type { Coordinates } from '../../domain/types'
import { createUserLocationElement } from '../../presentation/mapUserLocationElement.factory'
import type { MapInstanceManager } from '../core/MapInstanceManager'
import { resolveBrowserCurrentCoordinates } from '@/shared/utils/browserGeolocation'

export class UserLocationManager {
  private userLocationMarker: any = null
  private mapInstanceManager: MapInstanceManager

  constructor(mapInstanceManager: MapInstanceManager) {
    this.mapInstanceManager = mapInstanceManager
  }

  mountUserLocationMarker() {
    this.resolveCurrentPosition()
      .then((coordinates) => {
        if (!coordinates || !this.mapInstanceManager.getMap() || !this.mapInstanceManager.getAdvancedMarkerCtor()) {
          return
        }
        this.upsertUserLocationMarker(coordinates)
      })
      .catch(() => {
        // no-op: geolocation can fail if blocked by user or browser policy
      })
  }

  resolveCurrentPosition(): Promise<Coordinates | null> {
    if (!this.mapInstanceManager.getMap() || !this.mapInstanceManager.getAdvancedMarkerCtor() || !navigator.geolocation) {
      return Promise.resolve(null)
    }

    return resolveBrowserCurrentCoordinates().then((coordinates) => {
      if (!coordinates) {
        console.warn('Failed to retrieve user location')
      }

      return coordinates
    })
  }

  upsertUserLocationMarker(coordinates: Coordinates) {
    const map = this.mapInstanceManager.getMap()
    const AdvancedMarkerCtor = this.mapInstanceManager.getAdvancedMarkerCtor()

    if (!map || !AdvancedMarkerCtor) {
      return
    }

    if (this.userLocationMarker) {
      this.userLocationMarker.position = coordinates
      this.userLocationMarker.map = map
      return
    }

    this.userLocationMarker = new AdvancedMarkerCtor({
      map,
      position: coordinates,
      content: createUserLocationElement(),
      zIndex: 999,
    })
  }

  clearUserLocationMarker() {
    if (!this.userLocationMarker) {
      return
    }
    this.userLocationMarker.map = null
    this.userLocationMarker = null
  }
}
