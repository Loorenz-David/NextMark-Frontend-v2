import { useDriverLiveVisibilityStore } from '@/realtime/driverLive/driverLiveVisibility.store'
import { useZoneVisibilityStore } from '@/features/zone/store/zoneVisibility.store'
import { createLocateControlButton } from '../../presentation/mapLocateControlButton.factory'
import { createLocateControlContainer } from '../../presentation/mapLocateControlContainer.factory'
import { createDriverVisibilityControlButton } from '../../presentation/mapDriverVisibilityControlButton.factory'
import { createZoneVisibilityControlButton } from '../../presentation/mapZoneVisibilityControlButton.factory'
import type { MapInstanceManager } from '../core/MapInstanceManager'
import type { UserLocationManager } from '../location/UserLocationManager'

export class LocateControlManager {
  private locateControlContainer: HTMLElement | null = null
  private locateControlButton: HTMLButtonElement | null = null
  private driverVisibilityButton: HTMLButtonElement | null = null
  private zoneVisibilityButton: HTMLButtonElement | null = null
  private releaseDriverVisibilitySubscription: (() => void) | null = null
  private releaseZoneVisibilitySubscription: (() => void) | null = null
  private mapInstanceManager: MapInstanceManager
  private userLocationManager: UserLocationManager

  constructor(mapInstanceManager: MapInstanceManager, userLocationManager: UserLocationManager) {
    this.mapInstanceManager = mapInstanceManager
    this.userLocationManager = userLocationManager
  }

  mountLocateControl() {
    const map = this.mapInstanceManager.getMap()
    if (!map) {
      return
    }

    const button = createLocateControlButton(() => {
      void this.userLocationManager.resolveCurrentPosition().then((coordinates) => {
        if (!coordinates || !this.mapInstanceManager.getMap()) {
          return
        }

        this.userLocationManager.upsertUserLocationMarker(coordinates)
        this.mapInstanceManager.getMap()?.setOptions({
          center: coordinates,
          zoom: 14,
        })
      })
    })

    const visibilityControl = createDriverVisibilityControlButton({
      isVisible: useDriverLiveVisibilityStore.getState().isVisible,
      onClick: () => {
        useDriverLiveVisibilityStore.getState().toggleVisible()
      },
    })

    const zoneVisibilityControl = createZoneVisibilityControlButton({
      isVisible: useZoneVisibilityStore.getState().isVisible,
      onClick: () => {
        useZoneVisibilityStore.getState().toggleVisible()
      },
    })

    const container = createLocateControlContainer([
      visibilityControl.button,
      zoneVisibilityControl.button,
      button,
    ])
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(container)
    this.locateControlContainer = container
    this.locateControlButton = button
    this.driverVisibilityButton = visibilityControl.button
    this.zoneVisibilityButton = zoneVisibilityControl.button
    this.releaseDriverVisibilitySubscription = useDriverLiveVisibilityStore.subscribe((state) => {
      visibilityControl.syncState(state.isVisible)
    })
    this.releaseZoneVisibilitySubscription = useZoneVisibilityStore.subscribe((state) => {
      zoneVisibilityControl.syncState(state.isVisible)
    })
  }

  unmountLocateControl() {
    const map = this.mapInstanceManager.getMap()

    if (!this.locateControlContainer || !map) {
      this.locateControlContainer = null
      this.locateControlButton = null
      this.driverVisibilityButton = null
      this.zoneVisibilityButton = null
      if (this.releaseDriverVisibilitySubscription) {
        this.releaseDriverVisibilitySubscription()
        this.releaseDriverVisibilitySubscription = null
      }
      if (this.releaseZoneVisibilitySubscription) {
        this.releaseZoneVisibilitySubscription()
        this.releaseZoneVisibilitySubscription = null
      }
      return
    }

    if (this.locateControlButton) {
      this.locateControlButton.onclick = null
    }
    if (this.driverVisibilityButton) {
      this.driverVisibilityButton.onclick = null
    }
    if (this.zoneVisibilityButton) {
      this.zoneVisibilityButton.onclick = null
    }
    if (this.releaseDriverVisibilitySubscription) {
      this.releaseDriverVisibilitySubscription()
      this.releaseDriverVisibilitySubscription = null
    }
    if (this.releaseZoneVisibilitySubscription) {
      this.releaseZoneVisibilitySubscription()
      this.releaseZoneVisibilitySubscription = null
    }

    const controlArray = map.controls[google.maps.ControlPosition.RIGHT_BOTTOM]
    const index = controlArray?.getArray().indexOf(this.locateControlContainer) ?? -1
    if (controlArray && index > -1) {
      controlArray.removeAt(index)
    } else if (this.locateControlContainer.parentElement) {
      this.locateControlContainer.remove()
    }

    this.locateControlContainer = null
    this.locateControlButton = null
    this.driverVisibilityButton = null
    this.zoneVisibilityButton = null
  }
}
