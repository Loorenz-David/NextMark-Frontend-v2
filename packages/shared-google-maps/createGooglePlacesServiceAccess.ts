import { loadGoogleMaps } from './loadGoogleMaps'
import type {
  AutocompleteService,
  AutocompleteSessionToken,
  EnsureGooglePlacesServicesResult,
  GoogleMapsPlacesLibrary,
  PlaceConstructor,
  PlacesLibraryImport,
  PlacesService,
} from './types'

export function createGooglePlacesServiceAccess() {
  let autocompleteService: AutocompleteService | null = null
  let placesService: PlacesService | null = null
  let placeCtor: PlaceConstructor | null = null
  let sessionToken: AutocompleteSessionToken | null = null
  let placesLibrary: GoogleMapsPlacesLibrary | PlacesLibraryImport | null = null

  const ensureServices = async (): Promise<EnsureGooglePlacesServicesResult> => {
    const googleMaps = await loadGoogleMaps()

    if (!placesLibrary) {
      if (googleMaps.maps.importLibrary) {
        placesLibrary = await googleMaps.maps.importLibrary('places')
      } else {
        placesLibrary = googleMaps.maps.places
      }
    }

    const library = placesLibrary

    if (!library) {
      return {
        sessionToken: null,
        autocompleteService: null,
        placeCtor: null,
        placesService: null,
        library: null,
      }
    }

    if (!autocompleteService && library.AutocompleteService) {
      autocompleteService = new library.AutocompleteService()
    }

    if (!sessionToken && library.AutocompleteSessionToken) {
      sessionToken = new library.AutocompleteSessionToken()
    }

    if (!placeCtor && 'Place' in library && library.Place) {
      placeCtor = library.Place
    }

    if (!placeCtor && !placesService && library.PlacesService) {
      placesService = new library.PlacesService(document.createElement('div'))
    }

    return {
      sessionToken,
      autocompleteService,
      placeCtor,
      placesService,
      library,
    }
  }

  const resetSessionToken = () => {
    if (placesLibrary?.AutocompleteSessionToken) {
      sessionToken = new placesLibrary.AutocompleteSessionToken()
    }
  }

  return {
    ensureServices,
    resetSessionToken,
  }
}
