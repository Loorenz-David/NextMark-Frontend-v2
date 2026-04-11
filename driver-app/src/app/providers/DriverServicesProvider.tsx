import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
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
import { DriverServicesContext } from './driverServices.context'

export function DriverServicesProvider({ children }: PropsWithChildren) {
  const value = useMemo(() => ({
    addressAutocompleteService,
    authApi,
    authRegisterApi,
    browserLocationService,
    driverModeApi,
    routeExecutionApi,
    independentDriverApi,
    mapAppPreferenceService,
    mapNavigationService,
    phoneCallService,
  }), [])

  return (
    <DriverServicesContext.Provider value={value}>
      {children}
    </DriverServicesContext.Provider>
  )
}
