import { createContext, useContext } from 'react'
import { addressAutocompleteService } from '../services/addressAutocomplete.service'
import { authApi } from '../services/auth.api'
import { authRegisterApi } from '../services/authRegister.api'
import { browserLocationService } from '../services/browserLocation.service'
import { driverModeApi } from '../services/driverMode.api'
import { independentDriverApi } from '../services/independentDriver.api'
import { mapAppPreferenceService } from '../services/mapAppPreference.service'
import { mapNavigationService } from '../services/mapNavigation.service'
import { phoneCallService } from '../services/phoneCall.service'
import { routeExecutionApi } from '../services/routeExecution.api'

export type DriverServices = {
  addressAutocompleteService: typeof addressAutocompleteService
  authApi: typeof authApi
  authRegisterApi: typeof authRegisterApi
  browserLocationService: typeof browserLocationService
  driverModeApi: typeof driverModeApi
  routeExecutionApi: typeof routeExecutionApi
  independentDriverApi: typeof independentDriverApi
  mapAppPreferenceService: typeof mapAppPreferenceService
  mapNavigationService: typeof mapNavigationService
  phoneCallService: typeof phoneCallService
}

export const DriverServicesContext = createContext<DriverServices | null>(null)

export function useDriverServices() {
  const context = useContext(DriverServicesContext)
  if (!context) {
    throw new Error('useDriverServices must be used within DriverServicesProvider')
  }
  return context
}
