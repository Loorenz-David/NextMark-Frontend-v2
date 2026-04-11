export const CURRENT_LOCATION_STORAGE_KEY = 'user_current_location'
export const CURRENT_LOCATION_COORD_TOLERANCE = 0.0001
export const CURRENT_LOCATION_INPUT_LABEL = 'Current location'

export const SAVED_LOCATIONS_STORAGE_KEY = 'user_saved_locations'
export const SAVED_LOCATIONS_MAX = 5
export const SAVED_LOCATIONS_WRITE_THROTTLE_MS = 5000

export const resolveCurrentLocationStorageKey = (storageNamespace?: string): string =>
  storageNamespace?.trim()
    ? `${storageNamespace.trim()}:${CURRENT_LOCATION_STORAGE_KEY}`
    : CURRENT_LOCATION_STORAGE_KEY

export const resolveSavedLocationsStorageKey = (storageNamespace?: string): string =>
  storageNamespace?.trim()
    ? `${storageNamespace.trim()}:${SAVED_LOCATIONS_STORAGE_KEY}`
    : SAVED_LOCATIONS_STORAGE_KEY
