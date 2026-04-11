import type { Coordinates } from '@/shared/map'
import type { PreferredMapAppId } from './mapAppPreference.service'

export type MapNavigationDestination = {
  label: string
  address: string | null
  coordinates: Coordinates | null
}

function hasCoordinates(destination: MapNavigationDestination) {
  return (
    destination.coordinates != null
    && typeof destination.coordinates.lat === 'number'
    && typeof destination.coordinates.lng === 'number'
  )
}

function buildGoogleMapsUrl(destination: MapNavigationDestination) {
  const url = new URL('https://www.google.com/maps/dir/')

  if (hasCoordinates(destination)) {
    url.searchParams.set('api', '1')
    url.searchParams.set('destination', `${destination.coordinates!.lat},${destination.coordinates!.lng}`)
    return url.toString()
  }

  url.searchParams.set('api', '1')
  url.searchParams.set('destination', destination.address ?? destination.label)
  return url.toString()
}

function buildAppleMapsUrl(destination: MapNavigationDestination) {
  const url = new URL('https://maps.apple.com/')

  if (hasCoordinates(destination)) {
    url.searchParams.set('daddr', `${destination.coordinates!.lat},${destination.coordinates!.lng}`)
    if (destination.label) {
      url.searchParams.set('q', destination.label)
    }
    return url.toString()
  }

  url.searchParams.set('daddr', destination.address ?? destination.label)
  return url.toString()
}

function buildWazeUrl(destination: MapNavigationDestination) {
  const url = new URL('https://waze.com/ul')

  if (hasCoordinates(destination)) {
    url.searchParams.set('ll', `${destination.coordinates!.lat},${destination.coordinates!.lng}`)
  } else {
    url.searchParams.set('q', destination.address ?? destination.label)
  }

  url.searchParams.set('navigate', 'yes')
  return url.toString()
}

export const mapNavigationService = {
  isKnownAppId(value: string | null | undefined): value is PreferredMapAppId {
    return value === 'google-maps' || value === 'apple-maps' || value === 'waze'
  },
  buildUrl(appId: PreferredMapAppId, destination: MapNavigationDestination) {
    if (appId === 'google-maps') {
      return buildGoogleMapsUrl(destination)
    }
    if (appId === 'apple-maps') {
      return buildAppleMapsUrl(destination)
    }
    return buildWazeUrl(destination)
  },
  launch(appId: PreferredMapAppId, destination: MapNavigationDestination) {
    const url = this.buildUrl(appId, destination)
    window.location.href = url
  },
}
