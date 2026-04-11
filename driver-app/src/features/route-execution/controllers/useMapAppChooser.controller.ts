import { useState } from 'react'
import type { MapNavigationDestination } from '@/app/services/mapNavigation.service'
import { useDriverServices } from '@/app/providers/driverServices.context'
import type { PreferredMapAppId } from '@/app/services/mapAppPreference.service'

type UseMapAppChooserControllerDependencies = {
  destination: MapNavigationDestination
  onClose: () => void
}

export function useMapAppChooserController({
  destination,
  onClose,
}: UseMapAppChooserControllerDependencies) {
  const { mapAppPreferenceService, mapNavigationService } = useDriverServices()
  const [persistPreference, setPersistPreference] = useState(false)

  function selectMapApp(appId: PreferredMapAppId) {
    if (persistPreference) {
      mapAppPreferenceService.setPreferredApp(appId)
    }

    mapNavigationService.launch(appId, destination)
    onClose()
  }

  return {
    destination,
    persistPreference,
    setPersistPreference,
    selectMapApp,
  }
}
