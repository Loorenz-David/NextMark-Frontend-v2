import {
  mapAppPreferenceStorage,
  type PreferredMapAppId,
} from '../storage/mapAppPreferenceStorage'

export const mapAppPreferenceService = {
  getPreferredApp: (): PreferredMapAppId | null => mapAppPreferenceStorage.get(),
  setPreferredApp: (appId: PreferredMapAppId) => mapAppPreferenceStorage.set(appId),
  clearPreferredApp: () => mapAppPreferenceStorage.clear(),
}

export type { PreferredMapAppId } from '../storage/mapAppPreferenceStorage'
